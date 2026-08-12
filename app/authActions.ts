"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const prisma = new PrismaClient();

// Pripravíme si tajný kľúč pre JWT
const secretKey = process.env.JWT_SECRET || "nahradny-tajny-kluc";
const encodedKey = new TextEncoder().encode(secretKey);

// --- REGISTRÁCIA (Pôvodná funkcia) ---
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail a heslo sú povinné." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Tento e-mail už je zaregistrovaný." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Chyba pri registrácii:", error);
    return { error: "Nastala chyba pri registrácii. Skúste to prosím neskôr." };
  }
}

// --- PRIHLÁSENIE (Nová funkcia) ---
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Zadajte e-mail aj heslo." };
  }

  try {
    // 1. Nájdeme používateľa podľa e-mailu
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Nesprávny e-mail alebo heslo." };
    }

    // OPRAVA CHYBY: Skontrolujeme, či má používateľ vôbec heslo
    if (!user.password) {
      return { error: "Nesprávny e-mail alebo heslo." };
    }

    // 2. Overíme heslo (TypeScript teraz už vie, že user.password určite nie je null)
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return { error: "Nesprávny e-mail alebo heslo." };
    }

    // 3. Vytvoríme JWT token (platnosť napr. 7 dní)
    const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encodedKey);

    // 4. Uložíme token do HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set("trefiwa_session", token, {
      httpOnly: true, // Bezpečnosť proti XSS útokom
      secure: process.env.NODE_ENV === "production", // Len cez HTTPS v produkcii
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dní v sekundách
    });

    return { success: true };
  } catch (error) {
    console.error("Chyba pri prihlasovaní:", error);
    return { error: "Nastala chyba na serveri. Skúste to znova." };
  }
}
// --- ZÍSKANIE AKTUÁLNE PRIHLÁSENÉHO POUŽÍVATEĽA ---
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("trefiwa_session")?.value;

  if (!token) return null;

  try {
    // Overíme, či token nebol sfalšovaný a či nevypršal
    const { payload } = await jwtVerify(token, encodedKey);
    return {
      id: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch (error) {
    return null; // Token je neplatný alebo expirovaný
  }
}

// --- ODHLÁSENIE ---
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("trefiwa_session");
}