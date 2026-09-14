import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import { siteConfig } from "../lib/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "sk_SK", siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description, url: siteConfig.url },
  twitter: { card: "summary", title: siteConfig.name, description: siteConfig.description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", name: siteConfig.name, url: siteConfig.url }, { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, inLanguage: "sk-SK" }] }).replace(/</g, "\\u003c") }} />
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
