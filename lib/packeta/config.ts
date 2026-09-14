export const PACKETA_WIDGET_SCRIPT_URL = "https://widget.packeta.com/v6/www/js/library.js";

/**
 * These restrictions are used by both the browser widget and the server-side
 * validation request. Only Slovak Packeta pickup points and Z-BOXes are in scope.
 */
export const PACKETA_WIDGET_OPTIONS = {
  country: "sk",
  language: "sk",
  vendors: [
    { country: "sk", group: "" },
    { country: "sk", group: "zbox" },
  ],
} as const;

export function getPacketaServerApiKey() {
  return process.env.PACKETA_WIDGET_API_KEY?.trim() || null;
}

export function isPacketaWidgetConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY?.trim());
}
