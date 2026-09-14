type BankTransferInstructions =
  | { configured: true; recipientName: string; iban: string; bic: string | null; reference: string }
  | { configured: false; reference: string };

function requiredValue(name: "BANK_TRANSFER_RECIPIENT_NAME" | "BANK_TRANSFER_IBAN") {
  const value = process.env[name]?.trim();
  return value || null;
}

/** Server-only configuration. Account data is never sent until an order is authorized. */
export function getBankTransferInstructions(reference: string): BankTransferInstructions {
  const recipientName = requiredValue("BANK_TRANSFER_RECIPIENT_NAME");
  const iban = requiredValue("BANK_TRANSFER_IBAN");
  const bic = process.env.BANK_TRANSFER_BIC?.trim() || null;

  if (!recipientName || !iban) return { configured: false, reference };
  return { configured: true, recipientName, iban, bic, reference };
}
