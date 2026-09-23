"use client";

import Script from "next/script";
import { useId, useState } from "react";
import { PACKETA_WIDGET_OPTIONS, PACKETA_WIDGET_SCRIPT_URL, isPacketaWidgetConfigured } from "../../lib/packeta/config";
import { PACKETA_WIDGET_LOAD_ERROR, selectionAfterWidgetCallback, type PacketaSelection, type PacketaWidgetPoint } from "../../lib/packeta/selection";

declare global {
  interface Window {
    Packeta?: {
      Widget?: {
        pick: (
          apiKey: string,
          callback: (point: PacketaWidgetPoint | null) => void,
          options: typeof PACKETA_WIDGET_OPTIONS,
        ) => void;
      };
    };
  }
}

type Props = {
  value: PacketaSelection;
  onChange: (selection: PacketaSelection) => void;
};

export function PacketaPickupSelector({ value, onChange }: Props) {
  const [scriptReady, setScriptReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const descriptionId = useId();
  const publicApiKey = process.env.NEXT_PUBLIC_PACKETA_WIDGET_API_KEY?.trim();
  const configured = isPacketaWidgetConfigured() && Boolean(publicApiKey);

  const openWidget = () => {
    if (!configured || !publicApiKey) {
      setError("Výber výdajného miesta zatiaľ nie je nakonfigurovaný. Vyberte kuriéra na adresu.");
      return;
    }
    if (!window.Packeta?.Widget) {
      setError(PACKETA_WIDGET_LOAD_ERROR);
      return;
    }
    setError("");
    setIsOpening(true);
    try {
      window.Packeta.Widget.pick(publicApiKey, (point) => {
        setIsOpening(false);
        const next = selectionAfterWidgetCallback(value, point);
        if (next.selection !== value) onChange(next.selection);
        if (next.error) setError(next.error);
      }, PACKETA_WIDGET_OPTIONS);
    } catch {
      setIsOpening(false);
      setError(PACKETA_WIDGET_LOAD_ERROR);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-[#E8E6DF] bg-[#F9F8F6] p-4">
      {configured && <Script src={PACKETA_WIDGET_SCRIPT_URL} strategy="afterInteractive" onLoad={() => setScriptReady(true)} onError={() => setError(PACKETA_WIDGET_LOAD_ERROR)} />}
      <p id={descriptionId} className="text-sm text-[#6B6E56]">Vyberte slovenské výdajné miesto alebo Z-BOX priamo v mape Packeta.</p>
      {value ? (
        <div className="mt-3 rounded-lg border border-[#D5D3C9] bg-white p-3 text-sm" aria-live="polite">
          <span className="block text-xs font-bold uppercase tracking-wide text-[#8A9A5B]">Vybrané miesto Packeta</span>
          <strong className="mt-1 block text-[#2C2E26]">{value.name}</strong>
          <span className="mt-1 block text-[#6B6E56]">{value.address}</span>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
      <button type="button" onClick={openWidget} disabled={!configured || !scriptReady || isOpening} aria-describedby={descriptionId} className="mt-4 rounded-lg border border-[#5C6B46] px-4 py-2 text-sm font-bold text-[#4A5738] disabled:cursor-not-allowed disabled:opacity-60">
        {isOpening ? "Otváram výber…" : value ? "Zmeniť výdajné miesto" : "Vybrať výdajné miesto"}
      </button>
      {!configured ? <p className="mt-3 text-xs text-[#8A9A5B]">Výdajné miesto sa aktivuje po nakonfigurovaní služby Packeta.</p> : null}
    </div>
  );
}
