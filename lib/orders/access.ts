export function canViewAccountOrder(orderUserId: string | null, sessionUserId: string | null | undefined) {
  return Boolean(sessionUserId && orderUserId && orderUserId === sessionUserId);
}
