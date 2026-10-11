"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const SearchDialog = dynamic(() => import("./SearchDialog"), { ssr: false });

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  };

  return <>
    <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)} className="cursor-pointer transition-colors hover:text-[#8A9A5B]" aria-label="Otvoriť vyhľadávanie" aria-haspopup="dialog">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
    </button>
    {isOpen ? <SearchDialog onClose={close} /> : null}
  </>;
}
