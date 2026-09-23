import { Prisma } from "@prisma/client";
import { db } from "../db";
import { getEmailConfiguration, getEmailProvider, type EmailProvider, type OutgoingEmail } from "./provider";
import { renderAdminOrderNotification, renderCustomerOrderConfirmation } from "./templates";

export const EMAIL_TYPES = {
  CUSTOMER_ORDER_CONFIRMATION: "CUSTOMER_ORDER_CONFIRMATION",
  ADMIN_NEW_ORDER: "ADMIN_NEW_ORDER",
} as const;

type DispatchDependencies = { provider?: EmailProvider | null };

function trimError(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "Email provider returned an unknown error.";
}

async function sendOnce(input: {
  orderId: string;
  type: string;
  recipient: string;
  message: OutgoingEmail;
  provider: EmailProvider;
}) {
  let delivery = await db.emailDelivery.findUnique({ where: { orderId_type: { orderId: input.orderId, type: input.type } } });
  if (!delivery) {
    try {
      delivery = await db.emailDelivery.create({ data: { orderId: input.orderId, type: input.type, recipient: input.recipient } });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      delivery = await db.emailDelivery.findUnique({ where: { orderId_type: { orderId: input.orderId, type: input.type } } });
    }
  }
  if (!delivery || delivery.status === "SENT" || delivery.status === "SENDING") return { sent: false, skipped: true };

  const claimed = await db.emailDelivery.updateMany({
    where: { id: delivery.id, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "SENDING", attempts: { increment: 1 }, lastError: null },
  });
  if (claimed.count !== 1) return { sent: false, skipped: true };

  try {
    const result = await input.provider.send(input.message);
    await db.emailDelivery.update({ where: { id: delivery.id }, data: { status: "SENT", providerMessageId: result.messageId } });
    return { sent: true, skipped: false };
  } catch (error) {
    await db.emailDelivery.update({ where: { id: delivery.id }, data: { status: "FAILED", lastError: trimError(error) } });
    return { sent: false, skipped: false };
  }
}

/** Runs after order persistence; a provider failure cannot roll back checkout. */
export async function dispatchOrderEmails(orderNumber: string, dependencies: DispatchDependencies = {}) {
  const provider = dependencies.provider ?? getEmailProvider();
  const configuration = getEmailConfiguration();
  if (!provider || !configuration.from) return { configured: false, attempted: 0, sent: 0 };

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: { select: { productName: true, variantWeight: true, quantity: true, totalPrice: true } } },
  });
  if (!order || !order.customerEmail) return { configured: true, attempted: 0, sent: 0 };

  const customer = renderCustomerOrderConfirmation(order);
  const messages: Array<{ type: string; recipient: string; message: OutgoingEmail }> = [{
    type: EMAIL_TYPES.CUSTOMER_ORDER_CONFIRMATION,
    recipient: order.customerEmail,
    message: { ...customer, to: order.customerEmail, idempotencyKey: `${order.orderNumber}:${EMAIL_TYPES.CUSTOMER_ORDER_CONFIRMATION}` },
  }];
  if (configuration.adminRecipient) {
    const admin = renderAdminOrderNotification(order);
    messages.push({
      type: EMAIL_TYPES.ADMIN_NEW_ORDER,
      recipient: configuration.adminRecipient,
      message: { ...admin, to: configuration.adminRecipient, idempotencyKey: `${order.orderNumber}:${EMAIL_TYPES.ADMIN_NEW_ORDER}` },
    });
  }
  const results = await Promise.all(messages.map((message) => sendOnce({ ...message, orderId: order.id, provider })));
  return { configured: true, attempted: messages.length, sent: results.filter((result) => result.sent).length };
}
