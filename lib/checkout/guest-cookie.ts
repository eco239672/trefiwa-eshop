export const GUEST_ORDER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function guestOrderCookieName(orderNumber: string) {
  return `trefiwa_order_${orderNumber}`;
}

export function guestOrderCookieOptions(orderNumber: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: `/checkout/success/${orderNumber}`,
    maxAge: GUEST_ORDER_COOKIE_MAX_AGE_SECONDS,
  };
}
