"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product, CartItem } from "@/lib/types";
import { LS, lsGet, lsSet } from "@/lib/config";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number; color?: string; size?: string }
  | { type: "REMOVE_ITEM"; key: string }
  | { type: "UPDATE_QTY"; key: string; quantity: number }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "CLEAR_CART" };

function itemKey(item: { product: Product; color?: string; size?: string }): string {
  return `${item.product.id}|${item.color || ""}|${item.size || ""}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = itemKey(action);
      const existing = state.items.find((i) => itemKey(i) === key);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            itemKey(i) === key
              ? { ...i, quantity: i.quantity + (action.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity || 1,
            color: action.color,
            size: action.size,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => itemKey(i) !== action.key),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            itemKey(i) === action.key
              ? { ...i, quantity: action.quantity }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

const CartCtx = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  itemCount: number;
  total: number;
} | null>(null);

function initCart(): CartState {
  const stored = lsGet<CartItem[]>(LS.cart);
  return { items: Array.isArray(stored) ? stored : [], isOpen: false };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initCart);

  // 持久化购物车，刷新页面不丢失
  useEffect(() => {
    lsSet(LS.cart, state.items);
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartCtx.Provider value={{ state, dispatch, itemCount, total }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
