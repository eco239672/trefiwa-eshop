"use client";

import { useActionState } from "react";
import { updateOrderStatusAction, updatePaymentStatusAction, type AdminActionResult } from "./actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../lib/orders/status";

const initialState: AdminActionResult = { ok: false, error: "" };

function ActionMessage({ state }: { state: AdminActionResult }) {
  if (state.ok) return <p role="status" className="w-full text-xs text-green-700">{state.message}</p>;
  return state.error ? <p role="alert" className="w-full text-xs text-red-700">{state.error}</p> : null;
}

export function AdminOrderControls({ orderNumber, status, paymentStatus }: { orderNumber: string; status: string; paymentStatus: string }) {
  const [orderState, orderAction, orderPending] = useActionState(
    async (_state: AdminActionResult, formData: FormData): Promise<AdminActionResult> => updateOrderStatusAction(formData),
    initialState,
  );
  const [paymentState, paymentAction, paymentPending] = useActionState(
    async (_state: AdminActionResult, formData: FormData): Promise<AdminActionResult> => updatePaymentStatusAction(formData),
    initialState,
  );
  return <div className="grid gap-3 sm:grid-cols-2"><form action={orderAction} className="flex flex-wrap gap-2"><input type="hidden" name="orderNumber" value={orderNumber} /><select name="status" defaultValue={status} className="rounded-lg border border-[#D5D3C9] p-2">{Object.values(ORDER_STATUSES).map((value) => <option key={value}>{value}</option>)}</select><button disabled={orderPending} className="rounded-lg bg-[#5C6B46] px-3 text-sm font-bold text-white disabled:opacity-60">Uložiť stav</button><ActionMessage state={orderState} /></form><form action={paymentAction} className="flex flex-wrap gap-2"><input type="hidden" name="orderNumber" value={orderNumber} /><select name="paymentStatus" defaultValue={paymentStatus} className="rounded-lg border border-[#D5D3C9] p-2">{Object.values(PAYMENT_STATUSES).map((value) => <option key={value}>{value}</option>)}</select><button disabled={paymentPending} className="rounded-lg bg-[#5C6B46] px-3 text-sm font-bold text-white disabled:opacity-60">Uložiť platbu</button><ActionMessage state={paymentState} /></form></div>;
}
