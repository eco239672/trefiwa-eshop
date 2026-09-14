import { describe, expect, it, vi } from "vitest";
import { PacketaValidationError, validatePacketaPickupPoint } from "../lib/packeta/server";
import { selectionForDelivery, selectionFromPacketaWidget } from "../lib/packeta/selection";
import { PACKETA_WIDGET_OPTIONS, PACKETA_WIDGET_SCRIPT_URL, isPacketaWidgetConfigured } from "../lib/packeta/config";

function response(payload: unknown, ok = true) {
  return { ok, json: async () => payload } as unknown as Response;
}

const validPayload = {
  isValid: true,
  point: {
    id: "123",
    name: "Z-BOX Bratislava",
    group: "zbox",
    address: { street: "Hlavná 1", zip: "811 01", city: "Bratislava", country: "SK" },
  },
};

describe("Packeta server validation", () => {
  it("accepts a valid Slovak provider point and derives its snapshot", async () => {
    const fetchImpl = vi.fn(async () => response(validPayload));
    await expect(validatePacketaPickupPoint("123", { apiKey: "widget-key", fetchImpl })).resolves.toEqual({
      carrier: "Packeta", id: "123", name: "Z-BOX Bratislava", address: "Hlavná 1, 811 01, Bratislava", data: { country: "SK", group: "zbox" },
    });
  });

  it.each([
    ["fake point", { isValid: false, point: null }],
    ["non-SK point", { ...validPayload, point: { ...validPayload.point, address: { ...validPayload.point.address, country: "CZ" } } }],
    ["different provider ID", { ...validPayload, point: { ...validPayload.point, id: "999" } }],
  ])("rejects %s", async (_label, payload) => {
    await expect(validatePacketaPickupPoint("123", { apiKey: "widget-key", fetchImpl: async () => response(payload) })).rejects.toBeInstanceOf(PacketaValidationError);
  });

  it("rejects a malformed point ID before contacting Packeta", async () => {
    const fetchImpl = vi.fn();
    await expect(validatePacketaPickupPoint("<script>", { apiKey: "widget-key", fetchImpl })).rejects.toBeInstanceOf(PacketaValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("Packeta selection lifecycle", () => {
  const selection = { id: "123", name: "Z-BOX", address: "Bratislava" };

  it("resets selection after changing from pickup delivery", () => {
    expect(selectionForDelivery(false, selection)).toBeNull();
  });

  it("keeps no selection when the widget is cancelled", () => {
    expect(selectionForDelivery(true, null)).toBeNull();
  });

  it("derives the selected point name and address for checkout UI", () => {
    expect(selectionFromPacketaWidget({ id: 123, name: "Z-BOX Bratislava", street: "Hlavná 1", zip: "811 01", city: "Bratislava", country: "sk" })).toEqual({ id: "123", name: "Z-BOX Bratislava", address: "Hlavná 1, 811 01, Bratislava" });
  });

  it("rejects a non-Slovak widget response before it changes selection", () => {
    expect(selectionFromPacketaWidget({ id: 123, name: "Foreign point", country: "CZ" })).toBeNull();
  });

  it("uses the official Widget v6 library and Slovak-only options", () => {
    expect(PACKETA_WIDGET_SCRIPT_URL).toBe("https://widget.packeta.com/v6/www/js/library.js");
    expect(PACKETA_WIDGET_OPTIONS).toMatchObject({ country: "sk", language: "sk", vendors: [{ country: "sk", group: "" }, { country: "sk", group: "zbox" }] });
  });

  it("fails closed when the public widget key is missing", () => {
    const original = process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY;
    delete process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY;
    expect(isPacketaWidgetConfigured()).toBe(false);
    if (original === undefined) delete process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY;
    else process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY = original;
  });
});
