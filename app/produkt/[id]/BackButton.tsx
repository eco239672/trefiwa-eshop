"use client";

export default function BackButton() {
  return (
    <button 
      onClick={() => window.history.back()} 
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A9A5B] hover:text-[#5C6B46] mb-8 transition-colors cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Späť na predchádzajúcu stránku
    </button>
  );
}