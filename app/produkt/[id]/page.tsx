import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Ťaháme produkt priamo pomocou ID (ktoré je v DB string)
  const product = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] text-[#3D4035]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nebol nájdený</h1>
          <Link href="/" className="text-[#5C6B46] underline hover:text-[#4A5738]">
            Späť na ponuku
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035]">
      {/* Hlavička */}
      <header className="p-6 border-b border-[#E8E6DF] bg-white shadow-sm">
        <Link href="/" className="text-3xl font-bold tracking-widest text-[#5C6B46] hover:text-[#4A5738] transition-colors">
          TREFIWA
        </Link>
      </header>

      {/* Detail produktu */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-[#8A9A5B] hover:text-[#5C6B46] mb-8 transition-colors">
          &larr; Späť na celú ponuku
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-[#E8E6DF] overflow-hidden flex flex-col md:flex-row">
          {/* Ľavá strana: Obrázok */}
          <div className="md:w-1/2 bg-[#EFEFEA] min-h-[400px] flex items-center justify-center text-[#A3A697] text-lg">
            Obrázok pre: {product.name}
          </div>

          {/* Pravá strana: Informácie a nákup */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-sm font-semibold text-[#8A9A5B] mb-2 uppercase tracking-wide">
              Zdravá výživa
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2C2E26] mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-[#5C6B46] mb-6">
              {product.price.toString()} €
            </p>
            <p className="text-[#6B6E56] leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="mt-auto">
              <button className="w-full bg-[#5C6B46] text-white py-4 rounded-md font-medium text-lg hover:bg-[#4A5738] transition-colors shadow-sm active:scale-[0.98]">
                Pridať do košíka
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}