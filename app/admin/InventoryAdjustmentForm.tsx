"use client";

import { useActionState } from "react";
import { adjustStockAction, type AdminActionResult } from "./actions";

const initialState: AdminActionResult = { ok: false, error: "" };

export function InventoryAdjustmentForm({ variantId, label }: { variantId: string; label: string }) {
  const [state, action, pending] = useActionState(
    async (_state: AdminActionResult, formData: FormData): Promise<AdminActionResult> => adjustStockAction(formData),
    initialState,
  );
  return <form action={action} className="flex flex-wrap gap-2"><input type="hidden" name="variantId" value={variantId} /><input name="delta" inputMode="numeric" pattern="-?\\d+" aria-label={`Zmena skladu ${label}`} placeholder="+/- ks" className="w-20 rounded border border-[#D5D3C9] p-2" required /><input name="reason" maxLength={250} aria-label="Poznámka k úprave skladu" placeholder="Poznámka" className="w-40 rounded border border-[#D5D3C9] p-2" /><button disabled={pending} className="rounded bg-[#5C6B46] px-3 font-bold text-white disabled:opacity-60">Uložiť</button>{state.ok ? <p role="status" className="w-full text-xs text-green-700">{state.message}</p> : state.error ? <p role="alert" className="w-full text-xs text-red-700">{state.error}</p> : null}</form>;
}
