"use server";
import { PrismaClient } from "@prisma/client";

// Inicializácia pripojenia k databáze
const prisma = new PrismaClient();

// Funkcia na úpravu dát do formátu pre náš frontend
function formatProducts(data: any[]) {
  return data.map((product) => ({
    id: product.id, 
    name: product.name,
    price: product.price ? product.price.toString() + " €" : "0 €", // Ochrana ak by chýbala cena
    // Otázniky nás zachránia! Ak podkategória chýba, nevypne to server, len to napíše "Nezaradené"
    category: product.subcategory?.name || "Nezaradené", 
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