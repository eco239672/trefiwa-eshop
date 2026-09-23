"use client";

import { useActionState } from "react";
import { moderateReviewAction, type AdminActionResult } from "./actions";

const initialState: AdminActionResult = { ok: false, error: "" };

export function ReviewModerationControls({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(
    async (_state: AdminActionResult, formData: FormData): Promise<AdminActionResult> => moderateReviewAction(formData),
    initialState,
  );
  return <form action={action} className="mt-4 flex flex-wrap gap-3"><input type="hidden" name="reviewId" value={reviewId} /><button name="status" value="PUBLISHED" disabled={pending} className="rounded-lg bg-[#5C6B46] px-4 py-2 font-bold text-white disabled:opacity-60">Schváliť</button><button name="status" value="REJECTED" disabled={pending} className="rounded-lg border border-red-200 px-4 py-2 font-bold text-red-700 disabled:opacity-60">Odmietnuť</button>{state.ok ? <p role="status" className="w-full text-xs text-green-700">{state.message}</p> : state.error ? <p role="alert" className="w-full text-xs text-red-700">{state.error}</p> : null}</form>;
}
