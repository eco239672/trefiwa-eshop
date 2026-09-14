"use client";
import { useCart } from "../context/CartContext";
import Link from "next/link"; // Pridaný import pre Link
import { useRef } from "react";
import { useDialogFocus } from "./useDialogFocus";

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    setQuantity,
    removeFromCart,
    cartTotal,
    cartNotice,
  } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(isCartOpen, dialogRef, closeCart);

  return (
    <>
      {/* Tmavé pozadie (overlay) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity cursor-pointer"
          onClick={closeCart}
        />
      )}

      {/* Samotný vysúvací panel zprava */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Váš košík"
        aria-hidden={!isCartOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Hlavička košíka */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E6DF]">
          <h2 className="text-xl font-bold text-[#2C2E26]">Váš košík</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            className="text-[#A3A697] hover:text-[#D84949] p-2 bg-[#F9F8F6] rounded-full transition-colors"
            aria-label="Zavrieť košík"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Obsah košíka */}
        <div className="flex-grow overflow-y-auto p-6">
          {cartNotice ? <p role="status" className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">{cartNotice}</p> : null}
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#A3A697]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16 mb-4 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p>Váš košík je zatiaľ prázdny</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  {/* Fotka produktu */}
                  <div className="w-20 h-20 bg-[#EFEFEA] rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                      ></div>
                    ) : (
                      <span className="text-[10px] text-[#A3A697]">
                        Bez foto
                      </span>
                    )}
                  </div>

                  {/* Info a ovládanie */}
                  <div className="flex-grow">
                    <h4 className="font-semibold text-[#3D4035] leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[#5C6B46] font-bold mt-1">
                      {(typeof item.price === "number"
                        ? item.price
                        : parseFloat(item.price || "0")
                      ).toFixed(2)}{" "}
                      €
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-[#E8E6DF] rounded-md overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-1 text-[#6B6E56] hover:bg-[#F9F8F6] font-bold transition-colors"
                          aria-label={`Znížiť množstvo ${item.name}`}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setQuantity(item.id, val);
                          }}
                          className="w-10 text-center text-sm font-medium focus:outline-none focus:bg-[#F9F8F6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Množstvo ${item.name}`}
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-1 text-[#6B6E56] hover:bg-[#F9F8F6] font-bold transition-colors"
                          aria-label={`Zvýšiť množstvo ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-[#D84949] underline ml-auto hover:text-red-700 transition-colors"
                      >
                        Odstrániť
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spodná časť (Checkout) */}
        {cart.length > 0 && (
          <div className="border-t border-[#E8E6DF] p-6 bg-[#F9F8F6]">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-[#2C2E26]">
              <span>Spolu:</span>
              <span>{cartTotal.toFixed(2)} €</span>
            </div>
            {/* ZMENA: Namiesto <button> sme použili <Link>, aby to prešlo na /checkout */}
            <Link
              href="/checkout"
              onClick={closeCart} // po kliknutí zavrie bočný panel košíka
              className="w-full bg-[#5C6B46] text-white py-4 rounded-md font-bold text-lg hover:bg-[#4A5738] transition-colors shadow-md active:scale-[0.98] flex items-center justify-center"
            >
              K pokladni
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
