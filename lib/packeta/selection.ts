export type PacketaSelection = {
  id: string;
  name: string;
  address: string;
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

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Converts the widget response into display-only data; the server re-derives the order snapshot. */
export function selectionFromPacketaWidget(point: PacketaWidgetPoint): Exclude<PacketaSelection, null> | null {
  const id = point.id === undefined || point.id === null ? null : String(point.id).trim();
  const name = text(point.name);
  const country = text(point.country)?.toUpperCase();
  if (!id || !name || country !== "SK") return null;

  const address = [point.place, point.street, point.zip, point.city]
    .map(text)
    .filter((part): part is string => Boolean(part))
    .join(", ");
  return { id, name, address };
}

export function selectionForDelivery(requiresPickupPoint: boolean, selection: PacketaSelection) {
  return requiresPickupPoint ? selection : null;
}
