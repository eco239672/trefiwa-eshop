export type PacketaSelection = {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  country: "SK";
} | null;

export type PacketaWidgetPoint = {
  id?: string | number;
  name?: string;
  place?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
};

const PACKETA_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const UNSAFE_TEXT_PATTERN = /[<>\u0000-\u001F\u007F]/;
const MAX_NAME_LENGTH = 160;
const MAX_ADDRESS_LENGTH = 300;
const MAX_CITY_LENGTH = 120;
const MAX_ZIP_LENGTH = 24;

type UnknownRecord = Record<string, unknown>;

function asPlainRecord(value: unknown): UnknownRecord | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as UnknownRecord : null;
}

function text(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength || UNSAFE_TEXT_PATTERN.test(normalized)) return null;
  return normalized;
}

function pointId(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  return normalized && PACKETA_ID_PATTERN.test(normalized) ? normalized : null;
}

function pointAddress(place: unknown, street: unknown, zip: string, city: string) {
  const location = [text(place, MAX_ADDRESS_LENGTH), text(street, MAX_ADDRESS_LENGTH)].filter((part): part is string => Boolean(part));
  if (location.length === 0) return null;
  const address = [...location, zip, city].join(", ");
  return address.length <= MAX_ADDRESS_LENGTH ? address : null;
}

/** Converts the official Widget response into the checkout's selection snapshot. */
export function selectionFromPacketaWidget(point: PacketaWidgetPoint): Exclude<PacketaSelection, null> | null {
  const id = pointId(point.id);
  const name = text(point.name, MAX_NAME_LENGTH);
  const country = text(point.country, 2)?.toUpperCase();
  const city = text(point.city, MAX_CITY_LENGTH);
  const zip = text(point.zip, MAX_ZIP_LENGTH);
  if (!id || !name || country !== "SK" || !city || !zip) return null;
  const address = pointAddress(point.place, point.street, zip, city);
  if (!address) return null;

  return { id, name, address, city, zip, country: "SK" };
}

/**
 * Widget-only trust boundary: this validates a compact client-supplied snapshot
 * originating from the official Packeta Widget. It deliberately does not call a
 * Packeta server API and must never be used for prices, stock, coupons or payment.
 */
export function normalizePacketaPickupSnapshot(value: unknown): Exclude<PacketaSelection, null> | null {
  const point = asPlainRecord(value);
  if (!point) return null;
  const keys = Object.keys(point);
  if (keys.some((key) => !["id", "name", "address", "city", "zip", "country"].includes(key))) return null;

  const id = pointId(point.id);
  const name = text(point.name, MAX_NAME_LENGTH);
  const address = text(point.address, MAX_ADDRESS_LENGTH);
  const city = text(point.city, MAX_CITY_LENGTH);
  const zip = text(point.zip, MAX_ZIP_LENGTH);
  const country = text(point.country, 2)?.toUpperCase();
  if (!id || !name || !address || !city || !zip || country !== "SK") return null;

  return { id, name, address, city, zip, country: "SK" };
}

export function selectionForDelivery(requiresPickupPoint: boolean, selection: PacketaSelection) {
  return requiresPickupPoint ? selection : null;
}

/** A cancel or malformed Widget response never discards a previously selected point. */
export function selectionAfterWidgetCallback(current: PacketaSelection, point: PacketaWidgetPoint | null) {
  if (!point) return { selection: current, error: null };
  const selection = selectionFromPacketaWidget(point);
  return selection
    ? { selection, error: null }
    : { selection: current, error: "Vyberte platné výdajné miesto na Slovensku." };
}

export const PACKETA_WIDGET_LOAD_ERROR = "Výber výdajného miesta sa nepodarilo načítať. Skúste to znova.";
