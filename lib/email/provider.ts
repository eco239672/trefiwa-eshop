export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** A provider must use this to deduplicate retries. */
  idempotencyKey: string;
};

export type EmailSendResult = { messageId: string | null };

export interface EmailProvider {
  readonly id: string;
  send(message: OutgoingEmail): Promise<EmailSendResult>;
}

/**
 * Transactional sending is deliberately disabled until an explicitly configured
 * provider adapter is added. Returning null prevents a fake "sent" state.
 */
export function getEmailProvider(): EmailProvider | null {
  return null;
}

export function getEmailConfiguration() {
  const from = process.env.EMAIL_FROM?.trim() || null;
  const adminRecipient = process.env.ORDER_NOTIFICATION_EMAIL?.trim() || null;
  return { from, adminRecipient, configured: Boolean(getEmailProvider() && from) };
}
