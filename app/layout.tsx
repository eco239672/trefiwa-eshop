import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. NAIMPORTUJEME NAŠE NOVÉ KOMPONENTY
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TREFIWA",
  description: "E-shop pre zdravé potraviny a čaje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        {/* Celá stránka je Flexbox stĺpec s minimálnou výškou obrazovky */}
        <div className="flex flex-col min-h-screen">
          
          {/* 2. HLAVIČKA BUDE VŠADE HORE */}
          <Header />
          
          {/* Tu sa načítava obsah konkrétnych stránok (page.tsx) */}
          <div className="flex-grow">
            {children}
          </div>

          {/* 3. PÄTA BUDE VŠADE DOLE */}
          <Footer />

        </div>
      </body>
    </html>
  );
}