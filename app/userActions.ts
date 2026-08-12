"use server";

import { PrismaClient } from "@prisma/client";
import { getSession } from "./authActions";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- ZÍSKANIE ÚDAJOV POUŽÍVATEĽA ---
export async function getUserProfile() {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });
  
  return { success: true, user };
}

// --- ULOŽENIE FAKTURAČNÝCH ÚDAJOV ---
export async function saveBillingDetails(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const zip = formData.get("zip") as string;

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { company, phone, street, city, zip },
    });
    return { success: true, message: "Údaje boli úspešne uložené." };
  } catch (error) {
    return { error: "Nepodarilo sa uložiť údaje." };
  }
}

// --- ZMENA HESLA ---
export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  
  if (!user || !user.password) {
    return { error: "Váš účet nemá nastavené heslo." };
  }

  // Skontrolujeme, či aktuálne heslo sedí
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return { error: "Súčasné heslo nie je správne." };
  }

  // Zašifrujeme a uložíme nové heslo
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.id },
    data: { password: hashedNewPassword },
  });

  return { success: true, message: "Heslo bolo úspešne zmenené." };
}
// --- DORUČOVACIE ADRESY ---

// Načítanie všetkých adries používateľa
export async function getAddresses() {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: { isDefault: 'desc' } // Predvolená adresa bude vždy prvá
    });
    return { success: true, addresses };
  } catch (error) {
    return { error: "Nepodarilo sa načítať adresy." };
  }
}

// Pridanie alebo Úprava adresy
export async function saveAddress(formData: FormData, addressId?: string | null) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const name = formData.get("name") as string;
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const zip = formData.get("zip") as string;
  const phone = formData.get("phone") as string;

  if (!name || !street || !city || !zip) {
    return { error: "Vyplňte všetky povinné polia (okrem telefónu)." };
  }

  try {
    if (addressId) {
      // ÚPRAVA EXISTUJÚCEJ ADRESY
      await prisma.address.update({
        where: { id: addressId, userId: session.id }, // Overíme userId kvôli bezpečnosti
        data: { name, street, city, zip, phone },
      });
    } else {
      // PRIDANIE NOVEJ ADRESY
      // Ak je to prvá adresa, automaticky ju nastavíme ako predvolenú
      const count = await prisma.address.count({ where: { userId: session.id } });
      await prisma.address.create({
        data: {
          userId: session.id,
          name, street, city, zip, phone,
          isDefault: count === 0 
        },
      });
    }
    return { success: true, message: "Adresa bola úspešne uložená." };
  } catch (error) {
    return { error: "Nastala chyba pri ukladaní adresy." };
  }
}

// Vymazanie adresy
export async function deleteAddress(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  try {
    await prisma.address.delete({
      where: { id: addressId, userId: session.id },
    });
    return { success: true, message: "Adresa bola vymazaná." };
  } catch (error) {
    return { error: "Nastala chyba pri vymazávaní adresy." };
  }
}

// Nastavenie adresy ako predvolenej
export async function setAddressAsDefault(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  try {
    // 1. Zrušíme všetky súčasné predvolené adresy
    await prisma.address.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    });
    // 2. Nastavíme túto konkrétnu ako predvolenú
    await prisma.address.update({
      where: { id: addressId, userId: session.id },
      data: { isDefault: true },
    });
    return { success: true };
  } catch (error) {
    return { error: "Nastala chyba pri zmene predvolenej adresy." };
  }
}