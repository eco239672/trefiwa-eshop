"use client";

import dynamic from "next/dynamic";
import { useCart } from "../context/CartContext";

const CartSidebar = dynamic(() => import("./CartSidebar"), { ssr: false });

export default function DeferredCartSidebar() {
  const { isCartOpen } = useCart();
  return isCartOpen ? <CartSidebar /> : null;
}
