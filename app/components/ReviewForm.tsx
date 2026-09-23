"use client";

import { useState } from "react";
import { submitReview } from "../commerceActions";

export function ReviewForm({ productId, authenticated }: { productId: string; authenticated: boolean }) {
  const [rating, setRating] = useState("5");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!authenticated) return <p className="text-sm text-[#6B6E56]">Pre pridanie overenej recenzie sa prihláste.</p>;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const result = await submitReview({ productId, rating: Number(rating), content });
    if (result.ok) {
      setMessage(result.message ?? "Recenzia bola odoslaná na schválenie.");
      setContent("");
    } else {
      setMessage(result.error ?? "Recenziu sa nepodarilo odoslať.");
    }
    setSubmitting(false);
  };
  return <form onSubmit={submit} className="mt-5 grid gap-3 rounded-xl bg-[#F9F8F6] p-5"><label className="text-sm font-semibold">Hodnotenie<select value={rating} onChange={(event) => setRating(event.target.value)} className="ml-3 rounded border border-[#D5D3C9] p-2">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></label><label className="text-sm font-semibold">Vaša skúsenosť<textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={10} maxLength={2000} required className="mt-2 min-h-28 w-full rounded border border-[#D5D3C9] p-3 font-normal" /></label><button disabled={submitting} className="w-fit rounded-lg bg-[#5C6B46] px-4 py-2 font-bold text-white disabled:opacity-60">{submitting ? "Odosielam…" : "Odoslať na schválenie"}</button>{message ? <p role="status" className="text-sm text-[#6B6E56]">{message}</p> : null}</form>;
}
