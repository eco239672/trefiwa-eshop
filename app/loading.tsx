export default function Loading() {
  return <main className="min-h-[55vh] bg-[#F9F8F6] px-6 py-16" aria-busy="true" aria-label="Načítavam obsah"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-10 w-1/3 rounded bg-[#E8E6DF]" /><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 rounded-xl bg-[#E8E6DF]" />)}</div></div></main>;
}
