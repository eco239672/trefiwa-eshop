import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizePacketaPickupSnapshot,
  PACKETA_WIDGET_LOAD_ERROR,
  selectionAfterWidgetCallback,
  selectionForDelivery,
  selectionFromPacketaWidget,
} from "../lib/packeta/selection";
import { PACKETA_WIDGET_OPTIONS, PACKETA_WIDGET_SCRIPT_URL, isPacketaWidgetConfigured } from "../lib/packeta/config";

const selection = {
  id: "123",
  name: "Z-BOX Bratislava",
  address: "Hlavná 1, 811 01, Bratislava",
  city: "Bratislava",
  zip: "811 01",
  country: "SK" as const,
};

afterEach(() => vi.unstubAllEnvs());

describe("Packeta Widget v6 selection", () => {
  it("uses the official Widget v6 library with Slovak Packeta-only options", () => {
    expect(PACKETA_WIDGET_SCRIPT_URL).toBe("https://widget.packeta.com/v6/www/js/library.js");
    expect(PACKETA_WIDGET_OPTIONS).toEqual({ country: "sk", language: "sk", vendors: "packeta" });
  });

  it("derives a required snapshot from a valid Slovak Widget response", () => {
    expect(selectionFromPacketaWidget({
      id: 123,
      name: "Z-BOX Bratislava",
      street: "Hlavná 1",
      zip: "811 01",
      city: "Bratislava",
      country: "sk",
    })).toEqual(selection);
  });

  it.each([
    ["foreign country", { id: 123, name: "Foreign point", street: "Street 1", zip: "100 00", city: "Praha", country: "CZ" }],
    ["empty ID", { id: "", name: "Z-BOX", street: "Hlavná 1", zip: "811 01", city: "Bratislava", country: "SK" }],
    ["script-like name", { id: "123", name: "<script>", street: "Hlavná 1", zip: "811 01", city: "Bratislava", country: "SK" }],
    ["missing address", { id: "123", name: "Z-BOX", zip: "811 01", city: "Bratislava", country: "SK" }],
  ])("rejects invalid Widget response: %s", (_label, point) => {
    expect(selectionFromPacketaWidget(point)).toBeNull();
  });

  it.each([
    ["empty ID", { ...selection, id: "" }],
    ["oversized name", { ...selection, name: "x".repeat(161) }],
    ["script payload", { ...selection, address: "<img src=x>" }],
    ["unexpected property", { ...selection, providerUrl: "https://example.test" }],
  ])("rejects malformed client snapshot: %s", (_label, snapshot) => {
    expect(normalizePacketaPickupSnapshot(snapshot)).toBeNull();
  });

  it("accepts only the compact selection shape needed for the order snapshot", () => {
    expect(normalizePacketaPickupSnapshot(selection)).toEqual(selection);
  });

  it("keeps the existing selection on Widget cancel or invalid callback", () => {
    expect(selectionAfterWidgetCallback(selection, null)).toEqual({ selection, error: null });
    expect(selectionAfterWidgetCallback(selection, { id: "bad/point" })).toEqual({ selection, error: "Vyberte platné výdajné miesto na Slovensku." });
  });

  it("resets selection after changing from Packeta to another delivery method", () => {
    expect(selectionForDelivery(false, selection)).toBeNull();
    expect(selectionForDelivery(true, null)).toBeNull();
    expect(selectionForDelivery(true, selection)).toEqual(selection);
  });

  it("fails closed without the public Widget key and exposes a normal load error message", () => {
    vi.stubEnv("NEXT_PUBLIC_PACKETA_WIDGET_API_KEY", undefined);
    expect(isPacketaWidgetConfigured()).toBe(false);
    expect(PACKETA_WIDGET_LOAD_ERROR).toBe("Výber výdajného miesta sa nepodarilo načítať. Skúste to znova.");
  });
});
