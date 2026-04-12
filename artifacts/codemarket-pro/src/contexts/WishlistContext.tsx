import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/types";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isWishlisted: () => false,
  toggle: () => {},
  count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem("cth_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cth_wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => prev.some((p) => p.id === product.id) ? prev : [...prev, product]);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isWishlisted = (productId: string) => items.some((p) => p.id === productId);

  const toggle = (product: Product) => {
    isWishlisted(product.id) ? removeItem(product.id) : addItem(product);
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isWishlisted, toggle, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
