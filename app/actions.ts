"use server";
import { PrismaClient } from "@prisma/client";

// Inicializácia pripojenia k databáze
const prisma = new PrismaClient();

// Funkcia na úpravu dát do formátu pre náš frontend
function formatProducts(data: any[]) {
  return data.map((product) => ({
    id: product.id, 
    name: product.name,
    price: product.price ? product.price.toString() + " €" : "0 €",
    category: product.subcategory?.name || "Nezaradené", 
    imageUrl: product.imageUrl || null,
    
    // TOTO PRIDAJ, aby frontend vedel, či je tovar dostupný:
    stock: product.stock !== undefined ? Number(product.stock) : 1,
  }));
}

// Vytiahne úplne všetky produkty (na hlavnú stránku)
export async function getAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
    },
  });
  return formatProducts(products);
}

// Vytiahne produkty iba z konkrétnej PODKATEGÓRIE (napr. "Čínske čaje", "Zelené čaje")
export async function getProductsBySubcategory(subcategoryName: string) {
  const products = await prisma.product.findMany({
    where: {
      subcategory: {
        name: subcategoryName, // Tu už hľadáme v tabuľke SubCategory
      },
    },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
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
      subcategory: {
        include: {
          category: true,
        },
      },
    },
    take: 5, // Vráti maximálne 5 výsledkov, nech to nepreplní vyskakovacie okno
  });
  
  return formatProducts(products);
}