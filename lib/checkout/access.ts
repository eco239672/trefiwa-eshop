import { timingSafeEqual } from "node:crypto";

export function canAccessOrder(
  order: { userId: string | null; guestAccessToken: string | null },
  sessionUserId: string | null | undefined,
  presentedGuestToken: string | undefined,
) {
  if (order.userId) return sessionUserId === order.userId;
  if (!presentedGuestToken || !order.guestAccessToken) return false;

  const presented = Buffer.from(presentedGuestToken);
  const expected = Buffer.from(order.guestAccessToken);
  return presented.length === expected.length && timingSafeEqual(presented, expected);
}
