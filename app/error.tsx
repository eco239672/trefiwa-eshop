"use client";

import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Route rendering failed", { digest: error.digest }); }, [error.digest]);
  return <main className="flex min-h-[55vh] items-center justify-center bg-[#F9F8F6] px-6 text-center"><div><h1 className="mb-3 text-2xl font-bold text-[#2C2E26]">Obsah sa nepodarilo načítať</h1><p className="mb-6 text-[#6B6E56]">Skúste stránku načítať znova.</p><button type="button" onClick={reset} className="rounded-lg bg-[#5C6B46] px-5 py-3 font-bold text-white">Skúsiť znova</button></div></main>;
}
