import Link from "next/link";

export default function ONasPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-[#E8E6DF]">
        <h1 className="text-3xl md:text-5xl font-bold text-[#2C2E26] mb-8 border-b border-[#E8E6DF] pb-6">
          O nás
        </h1>
        
        <div className="space-y-6 text-lg text-[#6B6E56] leading-relaxed">
          <p>
            Vitajte v <strong>TREFIWA</strong>, vašom obľúbenom obchode pre tie najkvalitnejšie sypané čaje a zdravé potraviny.
          </p>
          <p>
            Náš príbeh začal s jednoduchou myšlienkou: priniesť ľuďom kúsok čistej prírody priamo do ich domovov. Veríme, že kvalitný čaj nie je len nápoj, ale rituál, ktorý spája ľudí, upokojuje myseľ a lieči telo.
          </p>
          <p>
            Všetky naše produkty starostlivo vyberáme od overených dodávateľov a dbáme na to, aby spĺňali tie najvyššie štandardy kvality a ekologickej udržateľnosti. Balíme ich pre vás s láskou a rešpektom k prírode do kompostovateľných obalov.
          </p>
          <p>
            Ďakujeme, že ste súčasťou našej cesty za zdravším a chutnejším životom.
          </p>
          
          <div className="pt-8 mt-8 border-t border-[#E8E6DF]">
            <Link href="/caje/cinske-caje" className="text-[#8A9A5B] font-bold hover:text-[#5C6B46] transition-colors">
              &rarr; Prejsť do obchodu a objaviť naše čaje
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}