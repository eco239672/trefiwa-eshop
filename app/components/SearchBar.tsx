"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { searchProducts } from "../actions";

// 1. PRIDANÝ imageUrl
type SearchResult = {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
};

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      searchProducts(searchQuery).then((data) => {
        setResults(data);
        setIsSearching(false);
      });
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <>
      {/* Tlačidlo Lupy */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:text-[#8A9A5B] transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>

      {/* Vyskakovacie (Modal) Okno na celú obrazovku */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center pt-32 px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 pt-14 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Tlačidlo na zatvorenie (X) */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#A3A697] hover:text-[#D84949] transition-colors p-2 bg-[#F9F8F6] rounded-full"
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

            {/* Vyhľadávacie pole */}
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9A5B]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať produkty (napíšte aspoň 2 znaky)..."
                className="w-full bg-[#F9F8F6] border border-[#E8E6DF] text-[#2C2E26] text-lg px-14 py-4 rounded-lg focus:outline-none focus:border-[#8A9A5B] focus:ring-1 focus:ring-[#8A9A5B] transition-all"
              />
            </div>

            {/* VÝSLEDKY VYHĽADÁVANIA */}
            <div className="mt-4 max-h-[50vh] overflow-y-auto">
              {isSearching && (
                <p className="text-center text-[#A3A697] py-4 text-sm">
                  Hľadám...
                </p>
              )}

              {!isSearching &&
                searchQuery.length > 1 &&
                results.length === 0 && (
                  <p className="text-center text-[#A3A697] py-4 text-sm">
                    Nenašli sa žiadne produkty pre "{searchQuery}".
                  </p>
                )}

              {!isSearching && results.length > 0 && (
                <div className="flex flex-col gap-2">
                  {results.map((item) => (
                    <Link
                      href={`/produkt/${item.id}`}
                      key={item.id}
                      onClick={handleClose}
                      className="flex items-center justify-between p-3 hover:bg-[#F9F8F6] rounded-md transition-colors border border-transparent hover:border-[#E8E6DF] group"
                    >
                      <div className="flex items-center gap-4">
                        {/* 2. OPRAVENÁ ČASŤ PRE OBRÁZOK */}
                        <div className="w-12 h-12 bg-[#EFEFEA] rounded flex items-center justify-center text-[10px] text-[#A3A697] overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="uppercase font-bold tracking-wider">
                              Foto
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-[#3D4035] group-hover:text-[#5C6B46] transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-xs text-[#8A9A5B]">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-[#5C6B46]">
                        {item.price}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
