/**
 * Shared JWT configuration for server-only code and the Next.js proxy.
 * A missing secret must fail closed; a hard-coded fallback would allow anyone
 * who knows the source to mint a valid session cookie.
 */
export function getJwtSigningKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured and contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}
