import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  couponCode: string;
  discountAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_COUPON"; code: string; discount: number }
  | { type: "CLEAR_COUPON" }
  | { type: "LOAD_CART"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find((i) => i.product.id === action.product.id);
      if (exists) return state;
      return { ...state, items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case "CLEAR_CART":
      return { items: [], couponCode: "", discountAmount: 0 };
    case "SET_COUPON":
      return { ...state, couponCode: action.code, discountAmount: action.discount };
    case "CLEAR_COUPON":
      return { ...state, couponCode: "", discountAmount: 0 };
    case "LOAD_CART":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  couponCode: string;
  discountAmount: number;
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    couponCode: "",
    discountAmount: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("codetradehub_cart");
    if (saved) {
      try {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: "LOAD_CART", items });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("codetradehub_cart", JSON.stringify(state.items));
  }, [state.items]);

  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = Math.max(0, subtotal - state.discountAmount);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
        itemCount: state.items.length,
        subtotal,
        total,
        addItem: (p) => dispatch({ type: "ADD_ITEM", product: p }),
        removeItem: (id) => dispatch({ type: "REMOVE_ITEM", productId: id }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        setCoupon: (code, discount) => dispatch({ type: "SET_COUPON", code, discount }),
        clearCoupon: () => dispatch({ type: "CLEAR_COUPON" }),
        isInCart: (id) => state.items.some((i) => i.product.id === id),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
