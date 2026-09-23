import { getBankTransferInstructions } from "../payments/bank-transfer";

type EmailOrder = {
  orderNumber: string;
  currency: string;
  total: { toString(): string } | number;
  paymentMethod: string;
  shippingMethodName: string | null;
  pickupPointCarrier: string | null;
  pickupPointName: string | null;
  pickupPointAddress: string | null;
  customerFirstName: string | null;
  items: Array<{
    productName: string;
    variantWeight: string;
    quantity: number;
    totalPrice: { toString(): string } | number;
  }>;
};

export type RenderedEmail = { subject: string; text: string; html: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function money(value: { toString(): string } | number, currency: string) {
  return `${Number(value).toFixed(2)} ${currency}`;
}

function orderLines(order: EmailOrder) {
  return order.items.map((item) => `${item.productName} (${item.variantWeight}) × ${item.quantity}: ${money(item.totalPrice, order.currency)}`);
}

function pickupText(order: EmailOrder) {
  if (!order.pickupPointCarrier || !order.pickupPointName) return null;
  return `${order.pickupPointCarrier}: ${order.pickupPointName}${order.pickupPointAddress ? `, ${order.pickupPointAddress}` : ""}`;
}

export function renderCustomerOrderConfirmation(order: EmailOrder): RenderedEmail {
  const name = order.customerFirstName || "";
  const pickup = pickupText(order);
  const lines = orderLines(order);
  const bank = order.paymentMethod === "BANK_TRANSFER" ? getBankTransferInstructions(order.orderNumber) : null;
  const text = [
    `Ďakujeme za objednávku ${order.orderNumber}${name ? `, ${name}` : ""}.`,
    "",
    "Položky:",
    ...lines,
    "",
    `Doprava: ${order.shippingMethodName || "neuvedená"}`,
    pickup ? `Výdajné miesto: ${pickup}` : "",
    `Spolu: ${money(order.total, order.currency)}`,
    bank?.configured ? ["", "Platba bankovým prevodom:", `Príjemca: ${bank.recipientName}`, `IBAN: ${bank.iban}`, bank.bic ? `BIC/SWIFT: ${bank.bic}` : "", `Referencia: ${bank.reference}`, `Suma: ${money(order.total, order.currency)}`].filter(Boolean).join("\n") : "",
  ].filter(Boolean).join("\n");
  const itemHtml = order.items.map((item) => `<li>${escapeHtml(item.productName)} (${escapeHtml(item.variantWeight)}) × ${item.quantity}: <strong>${escapeHtml(money(item.totalPrice, order.currency))}</strong></li>`).join("");
  const bankHtml = bank?.configured ? `<h2>Platba bankovým prevodom</h2><p>Príjemca: ${escapeHtml(bank.recipientName)}<br>IBAN: ${escapeHtml(bank.iban)}${bank.bic ? `<br>BIC/SWIFT: ${escapeHtml(bank.bic)}` : ""}<br>Referencia: ${escapeHtml(bank.reference)}<br>Suma: ${escapeHtml(money(order.total, order.currency))}</p>` : "";
  return {
    subject: `Potvrdenie objednávky ${order.orderNumber}`,
    text,
    html: `<main style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#2C2E26"><h1>Ďakujeme za objednávku</h1><p>Objednávka <strong>${escapeHtml(order.orderNumber)}</strong> bola prijatá.</p><h2>Položky</h2><ul>${itemHtml}</ul><p>Doprava: ${escapeHtml(order.shippingMethodName || "neuvedená")}</p>${pickup ? `<p>Výdajné miesto: ${escapeHtml(pickup)}</p>` : ""}<p><strong>Spolu: ${escapeHtml(money(order.total, order.currency))}</strong></p>${bankHtml}</main>`,
  };
}

export function renderAdminOrderNotification(order: EmailOrder): RenderedEmail {
  const lines = orderLines(order);
  return {
    subject: `Nová objednávka ${order.orderNumber}`,
    text: [`Nová objednávka: ${order.orderNumber}`, ...lines, `Spolu: ${money(order.total, order.currency)}`, `Doprava: ${order.shippingMethodName || "neuvedená"}`, pickupText(order) ? `Výdajné miesto: ${pickupText(order)}` : ""].filter(Boolean).join("\n"),
    html: `<main style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1>Nová objednávka ${escapeHtml(order.orderNumber)}</h1><ul>${order.items.map((item) => `<li>${escapeHtml(item.productName)} (${escapeHtml(item.variantWeight)}) × ${item.quantity}</li>`).join("")}</ul><p><strong>Spolu: ${escapeHtml(money(order.total, order.currency))}</strong></p></main>`,
  };
}
