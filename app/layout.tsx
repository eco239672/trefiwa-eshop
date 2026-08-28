import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";

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
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <CartSidebar /> {/* Náš nový vysúvací košík */}
            <div className="flex-grow bg-[#FAF4E8]">{children}</div>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
