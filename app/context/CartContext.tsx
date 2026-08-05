"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, amount: number) => void; // <--- Nová funkcia pre manuálne vpísanie
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      const parsedPrice = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(',', '.').replace(/[^0-9.]/g, '')) 
        : Number(product.price);

      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: parsedPrice || 0,
        imageUrl: product.imageUrl, // <--- Prenášame obrázok
        quantity: 1 
      }];
    });
    openCart(); 
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  // NOVÉ: Funkcia pre manuálne vpísanie čísla do inputu
  const setQuantity = (id: string, amount: number) => {
    if (amount < 1) return; // Nemôžeš mať v košíku 0 a menej (na to slúži odstránenie)
    setCart((prev) => prev.map((item) =>
      item.id === id ? { ...item, quantity: amount } : item
    ));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, isCartOpen, openCart, closeCart, addToCart, removeFromCart, updateQuantity, setQuantity, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart musí byť použitý vo vnútri CartProvider");
  return context;
}