"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getJwtSigningKey } from "../lib/session";
import { db } from "../lib/db";
import { consumeRequestRateLimit } from "../lib/security/rate-limit";

function getFormText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- REGISTRÁCIA (Pôvodná funkcia) ---
export async function registerUser(formData: FormData) {
  const name = getFormText(formData, "name");
  const email = getFormText(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (!name || name.length > 100 || !isValidEmail(email)) {
    return { error: "Zadajte platné meno a e-mailovú adresu." };
  }

  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    return { error: "Heslo musí mať 12 až 128 znakov." };
  }

  const rateLimit = await consumeRequestRateLimit("auth_register", email, 5, 60 * 60);
  if (!rateLimit.allowed) return { error: "Príliš veľa pokusov. Skúste to neskôr." };

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Tento e-mail už je zaregistrovaný." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
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
  const email = getFormText(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
    return { error: "Zadajte e-mail aj heslo." };
  }

  const rateLimit = await consumeRequestRateLimit("auth_login", email, 10, 15 * 60);
  if (!rateLimit.allowed) return { error: "Príliš veľa pokusov. Skúste to neskôr." };

  try {
    // 1. Nájdeme používateľa podľa e-mailu
    const user = await db.user.findUnique({ where: { email } });
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
      .sign(getJwtSigningKey());

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
    const { payload } = await jwtVerify(token, getJwtSigningKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null; // Token je neplatný alebo expirovaný
  }
}

// --- ODHLÁSENIE ---
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("trefiwa_session");
}
