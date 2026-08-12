"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail a heslo sú povinné." };
  }

  try {
    // 1. Skontrolujeme, či užívateľ s týmto e-mailom už neexistuje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Tento e-mail už je zaregistrovaný." };
    }

    // 2. Zašifrujeme heslo (10 je "salt rounds" - úroveň bezpečnosti)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Vytvoríme nového užívateľa v databáze
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Chyba pri registrácii:", error);
    return { error: "Nastala chyba pri registrácii. Skúste to prosím neskôr." };
  }
}