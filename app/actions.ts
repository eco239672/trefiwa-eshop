"use server";
import { PrismaClient } from "@prisma/client";

// Inicializácia pripojenia k databáze
const prisma = new PrismaClient();

// Funkcia na úpravu dát do formátu pre náš frontend
function formatProducts(data: any[]) {
  return data.map((product) => {
    const rawVariants = product.variants || [];
    
    // TOTO SME PRIDALI: Očistenie variantov od Prisma Decimal objektov
    const cleanVariants = rawVariants.map((v: any) => ({
      id: v.id,
      productId: v.productId,
      weight: v.weight,
      price: Number(v.price), // Prevod na obyčajné číslo
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      stock: Number(v.stock),
    }));

    // Zistíme najnižšiu cenu z OČISTENÝCH variantov
    let displayPrice = "Cena neurčená";
    if (cleanVariants.length > 0) {
      const prices = cleanVariants.map((v: any) => v.price);
      const minPrice = Math.min(...prices);
      displayPrice = `od ${minPrice.toFixed(2)} €`;
    }

    // Zistíme, či je aspoň jeden variant na sklade
    const isAnyInStock = cleanVariants.some((v: any) => v.stock > 0);

    return {
      id: product.id,
      name: product.name,
      price: displayPrice,
      category: product.subCategory?.name || "Nezaradené",
      imageUrl: product.imageUrl || null,
      stock: isAnyInStock ? 1 : 0,
      variants: cleanVariants, // Posielame už iba čisté varianty!
    };
  });
}

// Vytiahne úplne všetky produkty (na hlavnú stránku)
export async function getAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      subCategory: {
        include: { category: true},
      },
      variants: true, // Zahrnieme aj varianty, aby sme mohli zistiť cenu a skladovosť
    },
  });
  return formatProducts(products);
}

// Vytiahne produkty iba z konkrétnej PODKATEGÓRIE (napr. "Čínske čaje", "Zelené čaje")
export async function getProductsBySubCategory(subCategoryName: string) {
  const products = await prisma.product.findMany({
    where: {
      subCategory: {
        name: subCategoryName, // Tu už hľadáme v tabuľke SubCategory
      },
    },
    include: {
      subCategory: {
        include: { category: true},
      },
      variants: true, // Zahrnieme aj varianty, aby sme mohli zistiť cenu a skladovosť
    },
  });
  return formatProducts(products);
}

// Vyhľadávanie produktov podľa názvu (Live Search)
export async function searchProducts(query: string) {
  if (!query) return []; // Ak je prázdny text, nevráti nič
  
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query, // Hľadá tento text v názve
        mode: "insensitive", // Ignoruje veľké/malé písmená (čiže nájde aj "čaj", aj "ČAJ")
      },
    },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
    },
    take: 5, // Vráti maximálne 5 výsledkov, nech to nepreplní vyskakovacie okno
  });
  
  return formatProducts(products);
}