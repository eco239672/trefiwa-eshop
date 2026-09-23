export const PACKETA_WIDGET_SCRIPT_URL = "https://widget.packeta.com/v6/www/js/library.js";

/**
 * Official Packeta Widget v6 options. `country` limits this checkout method to
 * Slovakia; `vendors: "packeta"` leaves the merchant's own Packeta branches and
 * Z-BOXes enabled while excluding external carrier PUDOs.
 */
export const PACKETA_WIDGET_OPTIONS = {
  country: "sk",
  language: "sk",
  vendors: "packeta",
} as const;

export function isPacketaWidgetConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY?.trim());
}
