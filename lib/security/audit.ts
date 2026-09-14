type SecurityEvent = "rate_limit_denied" | "rate_limit_unavailable";

/** Deliberately excludes credentials, session tokens, IPs, e-mail addresses and order data. */
export function logSecurityEvent(event: SecurityEvent, scope: string) {
  console.warn(JSON.stringify({ event, scope, at: new Date().toISOString() }));
}
