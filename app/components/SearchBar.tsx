"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchProducts } from "../actions";
import { useDialogFocus } from "./useDialogFocus";

type SearchResult = Awaited<ReturnType<typeof searchProducts>>[number];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestId = useRef(0);
  const dialogRef = useRef<HTMLElement>(null);

  const close = () => {
    requestId.current += 1;
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setError("");
    setActiveIndex(-1);
    queueMicrotask(() => triggerRef.current?.focus());
  };

  useDialogFocus(isOpen, dialogRef, close);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return;
    const id = ++requestId.current;
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");
      try {
        const data = await searchProducts(normalized);
        if (id === requestId.current) {
          setResults(data);
          setActiveIndex(-1);
        }
      } catch {
        if (id === requestId.current) setError("Vyhľadávanie sa nepodarilo dokončiť. Skúste to znova.");
      } finally {
        if (id === requestId.current) setIsSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const updateQuery = (value: string) => {
    requestId.current += 1;
    setQuery(value);
    setActiveIndex(-1);
    setError("");
    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)); }
    if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
    if (event.key === "Enter" && activeIndex >= 0) { event.preventDefault(); document.getElementById(`search-result-${activeIndex}`)?.click(); }
  };

  return <>
    <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)} className="cursor-pointer transition-colors hover:text-[#8A9A5B]" aria-label="Otvoriť vyhľadávanie" aria-haspopup="dialog">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
    </button>
    {isOpen ? <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm md:pt-32" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-label="Vyhľadávanie produktov" className="relative w-full max-w-3xl rounded-xl bg-white p-6 pt-14 shadow-2xl">
        <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full bg-[#F9F8F6] p-2 text-[#A3A697] transition-colors hover:text-[#D84949]" aria-label="Zavrieť vyhľadávanie">×</button>
        <label htmlFor="product-search" className="sr-only">Hľadať produkty</label>
        <input ref={inputRef} id="product-search" type="search" value={query} onChange={(event) => updateQuery(event.target.value)} onKeyDown={onInputKeyDown} placeholder="Hľadať produkty (aspoň 2 znaky)…" className="w-full rounded-lg border border-[#E8E6DF] bg-[#F9F8F6] px-5 py-4 text-lg text-[#2C2E26] focus:border-[#8A9A5B] focus:outline-none focus:ring-1 focus:ring-[#8A9A5B]" aria-controls="search-results" aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined} />
        <div id="search-results" className="mt-4 max-h-[50vh] overflow-y-auto" role="listbox" aria-busy={isSearching}>
          {isSearching ? <p className="py-4 text-center text-sm text-[#A3A697]">Hľadám…</p> : null}
          {error ? <p className="py-4 text-center text-sm text-red-700" role="alert">{error}</p> : null}
          {!isSearching && !error && query.trim().length > 1 && !results.length ? <p className="py-4 text-center text-sm text-[#A3A697]">Pre tento výraz sa nenašli žiadne produkty.</p> : null}
          {!isSearching && results.length ? <div className="flex flex-col gap-2">{results.map((item, index) => {
            const localImage = item.imageUrl?.startsWith("/") ? item.imageUrl : null;
            return <Link href={`/produkt/${item.id}`} id={`search-result-${index}`} key={item.id} role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={close} className={`group flex items-center justify-between rounded-md border p-3 transition-colors ${activeIndex === index ? "border-[#8A9A5B] bg-[#F9F8F6]" : "border-transparent hover:border-[#E8E6DF] hover:bg-[#F9F8F6]"}`}>
              <span className="flex items-center gap-4"><span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#EFEFEA] text-[10px] text-[#A3A697]">{localImage ? <Image src={localImage} alt="" fill sizes="48px" className="object-cover" /> : "Foto"}</span><span><strong className="block text-[#3D4035] group-hover:text-[#5C6B46]">{item.name}</strong><span className="text-xs text-[#8A9A5B]">{item.category}</span></span></span><strong className="text-[#5C6B46]">{item.price}</strong>
            </Link>;
          })}</div> : null}
        </div>
      </section>
    </div> : null}
  </>;
}
