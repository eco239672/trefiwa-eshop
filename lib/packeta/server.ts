import { PACKETA_WIDGET_OPTIONS, getPacketaServerApiKey } from "./config";

const PACKETA_VALIDATION_URL = "https://widget.packeta.com/v6/pps/api/widget/v1/validate";
const PICKUP_POINT_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

export class PacketaValidationError extends Error {}

type UnknownRecord = Record<string, unknown>;

export type VerifiedPacketaPickupPoint = {
  carrier: "Packeta";
  id: string;
  name: string;
  address: string;
  data: { country: "SK"; group: string | null };
};

type ValidateDependencies = {
  apiKey?: string | null;
  fetchImpl?: typeof fetch;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function requiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pointIdText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
}

/**
 * Converts only the provider response into an order snapshot. Client-supplied
 * labels and address fields are intentionally not accepted by this API.
 */
export async function validatePacketaPickupPoint(
  pointId: string,
  dependencies: ValidateDependencies = {},
): Promise<VerifiedPacketaPickupPoint> {
  if (!PICKUP_POINT_ID_PATTERN.test(pointId)) {
    throw new PacketaValidationError("Vybrané výdajné miesto má neplatný identifikátor.");
  }

  const apiKey = dependencies.apiKey ?? getPacketaServerApiKey();
  if (!apiKey) {
    throw new PacketaValidationError("Výdajné miesto Packeta zatiaľ nie je nakonfigurované.");
  }

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(PACKETA_VALIDATION_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        apiKey,
        options: { ...PACKETA_WIDGET_OPTIONS, carriers: "packeta" },
        point: { id: pointId },
      }),
    });
  } catch {
    throw new PacketaValidationError("Výdajné miesto sa nepodarilo overiť. Skúste to znova.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PacketaValidationError("Výdajné miesto sa nepodarilo overiť. Skúste to znova.");
  }

  const body = asRecord(payload);
  const point = asRecord(body?.point);
  const address = asRecord(point?.address);
  const valid = body?.isValid === true;
  const id = pointIdText(point?.id);
  const name = requiredText(point?.name);
  const country = requiredText(address?.country)?.toUpperCase();
  const street = requiredText(address?.street);
  const city = requiredText(address?.city);
  const zip = requiredText(address?.zip);

  if (!response.ok || !valid || id !== pointId || !name || country !== "SK" || !city || !zip) {
    throw new PacketaValidationError("Vybrané výdajné miesto nie je platné pre Slovensko.");
  }

  const group = requiredText(point?.group);
  return {
    carrier: "Packeta",
    id,
    name,
    address: [street, zip, city].filter(Boolean).join(", "),
    data: { country: "SK", group },
  };
}
