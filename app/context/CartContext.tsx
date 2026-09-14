"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { validateCartVariantIds } from "../actions";
import { keepExistingCartVariants, sanitizePersistedCart, type CartLine } from "../../lib/cart/validation";

// Definícia toho, čo obsahuje jeden produkt v košíku
export type CartItem = CartLine;

// Definícia funkcií pre kontext
type CartContextType = {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  cartTotal: number;
  cartNotice: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartNotice, setCartNotice] = useState("");

  // 1. Pri načítaní stiahneme košík z Local Storage
  useEffect(() => {
    let cancelled = false;
    const restoreCart = async () => {
      const savedCart = localStorage.getItem("trefiwa_cart");
      if (!savedCart) {
        setIsLoaded(true);
        return;
      }
      try {
        const parsed = sanitizePersistedCart(JSON.parse(savedCart));
        if (parsed.removedCount) setCartNotice("Produkt v košíku už nie je dostupný a bol odstránený.");
        setCart(parsed.items);
        setIsLoaded(true);

        if (!parsed.items.length) return;
        const validation = await validateCartVariantIds(parsed.items.map((item) => item.variantId));
        if (cancelled || !validation.ok) return;
        const sanitized = keepExistingCartVariants(parsed.items, validation.variantIds);
        if (sanitized.removedCount) {
          setCart(sanitized.items);
          setCartNotice("Produkt v košíku už nie je dostupný a bol odstránený.");
        }
      } catch (e) {
        console.error("Nepodarilo sa načítať košík", e);
        if (!cancelled) {
          setCart([]);
          setCartNotice("Košík sa nepodarilo obnoviť a bol vyprázdnený.");
          setIsLoaded(true);
        }
      }
    };
    void restoreCart();
    return () => { cancelled = true; };
  }, []);

  // 2. Pri akejkoľvek zmene uložíme košík
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("trefiwa_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (item: CartItem) => {
    if (!item.variantId) {
      setCartNotice("Tento produkt nemá platné balenie a nedá sa pridať do košíka.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? // Striktný prevod na číslo, aby sme zabránili lepeniu textov (1+1=11)
              {
                ...i,
                quantity:
                  (Number(i.quantity) || 1) + (Number(item.quantity) || 1),
              }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Number(item.quantity) || 1 }];
    });
    openCart();
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Striktne určíme, že to je číslo, a pripočítame/odpočítame
          const currentQty = Number(item.quantity) || 1;
          const newQuantity = Math.max(1, currentQty + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const setQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item,
      ),
    );
  };

  // Vylepšený výpočet celkovej sumy (odolný voči textom a čiarkam)
  const cartTotal = cart.reduce((total, item) => {
    let price = 0;
    if (typeof item.price === "number") {
      price = item.price;
    } else if (typeof item.price === "string") {
      const cleanString = item.price.replace(",", ".").replace(/[^0-9.]/g, "");
      price = parseFloat(cleanString) || 0;
    }

    const qty = Number(item.quantity) || 1;
    return total + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        setQuantity,
        cartTotal,
        cartNotice,
      }}
    >
      {isLoaded ? children : <div className="hidden">{children}</div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart musí byť použitý vo vnútri CartProvider");
  }
  return context;
}
