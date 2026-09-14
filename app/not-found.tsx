import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-[55vh] items-center justify-center bg-[#F9F8F6] px-6 text-center text-[#3D4035]"><div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#8A9A5B]">404</p><h1 className="mb-4 text-3xl font-bold text-[#2C2E26]">Stránku sa nepodarilo nájsť</h1><p className="mb-6 text-[#6B6E56]">Možno bola presunutá alebo odkaz už nie je aktuálny.</p><Link href="/" className="rounded-lg bg-[#5C6B46] px-5 py-3 font-bold text-white">Späť na úvod</Link></div></main>;
}
