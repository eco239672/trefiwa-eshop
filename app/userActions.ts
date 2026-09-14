"use server";

import { getSession } from "./authActions";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { consumeRequestRateLimit } from "../lib/security/rate-limit";

// --- ZÍSKANIE ÚDAJOV POUŽÍVATEĽA ---
export async function getUserProfile() {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      street: true,
      city: true,
      zip: true,
    },
  });

  if (!user) return { error: "Používateľ nebol nájdený." };

  return { success: true, user };
}

// --- ULOŽENIE FAKTURAČNÝCH ÚDAJOV ---
export async function saveBillingDetails(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const getText = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const company = getText("company");
  const phone = getText("phone");
  const street = getText("street");
  const city = getText("city");
  const zip = getText("zip");

  if ([company, phone, street, city, zip].some((value) => value.length > 150)) {
    return { error: "Jedno z polí je príliš dlhé." };
  }

  try {
    await db.user.update({
      where: { id: session.id },
      data: { company, phone, street, city, zip },
    });
    return { success: true, message: "Údaje boli úspešne uložené." };
  } catch {
    return { error: "Nepodarilo sa uložiť údaje." };
  }
}

// --- ZMENA HESLA ---
export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  const oldPassword = formData.get("oldPassword");
  const newPassword = formData.get("newPassword");

  if (
    typeof oldPassword !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 12 ||
    newPassword.length > 128
  ) {
    return { error: "Nové heslo musí mať 12 až 128 znakov." };
  }

  const rateLimit = await consumeRequestRateLimit("auth_change_password", session.id, 5, 15 * 60);
  if (!rateLimit.allowed) return { error: "Príliš veľa pokusov. Skúste to neskôr." };

  const user = await db.user.findUnique({ where: { id: session.id } });
  
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
  await db.user.update({
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
    const addresses = await db.address.findMany({
      where: { userId: session.id },
      orderBy: { isDefault: 'desc' } // Predvolená adresa bude vždy prvá
    });
    return { success: true, addresses };
  } catch {
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
      await db.address.update({
        where: { id: addressId, userId: session.id }, // Overíme userId kvôli bezpečnosti
        data: { name, street, city, zip, phone },
      });
    } else {
      // PRIDANIE NOVEJ ADRESY
      // Ak je to prvá adresa, automaticky ju nastavíme ako predvolenú
      const count = await db.address.count({ where: { userId: session.id } });
      await db.address.create({
        data: {
          userId: session.id,
          name, street, city, zip, phone,
          isDefault: count === 0 
        },
      });
    }
    return { success: true, message: "Adresa bola úspešne uložená." };
  } catch {
    return { error: "Nastala chyba pri ukladaní adresy." };
  }
}

// Vymazanie adresy
export async function deleteAddress(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  try {
    await db.address.delete({
      where: { id: addressId, userId: session.id },
    });
    return { success: true, message: "Adresa bola vymazaná." };
  } catch {
    return { error: "Nastala chyba pri vymazávaní adresy." };
  }
}

// Nastavenie adresy ako predvolenej
export async function setAddressAsDefault(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Neprihlásený" };

  try {
    // 1. Zrušíme všetky súčasné predvolené adresy
    await db.address.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    });
    // 2. Nastavíme túto konkrétnu ako predvolenú
    await db.address.update({
      where: { id: addressId, userId: session.id },
      data: { isDefault: true },
    });
    return { success: true };
  } catch {
    return { error: "Nastala chyba pri zmene predvolenej adresy." };
  }
}
