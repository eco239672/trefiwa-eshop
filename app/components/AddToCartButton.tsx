"use client";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../context/CartContext";

export default function AddToCartButton({ product, stock }: { product: CartItem; stock: number }) {
  const { addToCart } = useCart();

  return (
    <button 
      disabled={stock === 0}
      onClick={() => addToCart(product)}
      className={`w-full py-4 rounded-md font-bold text-lg tracking-wide transition-all shadow-md active:scale-[0.98] mb-8
        ${stock > 0 
          ? 'bg-[#5C6B46] text-white hover:bg-[#4A5738] hover:shadow-lg' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
    >
      {stock > 0 ? 'Vložiť do košíka' : 'Momentálne nedostupné'}
    </button>
  );
}
