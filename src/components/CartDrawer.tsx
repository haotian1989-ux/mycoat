"use client";
import { optimizeImage } from "@/lib/image";

import { X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DATA_MODE, LS, lsGet } from "@/lib/config";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { state, dispatch, itemCount, total } = useCart();
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<{ type: string; url: string }[]>(LS.contact);
      const wa = (stored || []).find((l) => l.type === "whatsapp");
      if (wa?.url) setWhatsappUrl(wa.url);
    } else {
      supabase.from("contact_links").select("*").then(({ data }) => {
        const wa = (data || []).find((l: any) => l.type === "whatsapp");
        if (wa?.url) setWhatsappUrl(wa.url);
      });
    }
  }, []);

  if (!state.isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-charcoal/40 z-50 backdrop-blur-sm"
        onClick={() => dispatch({ type: "CLOSE_CART" })}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-paper z-50 flex flex-col shadow-2xl animate-[slideIn_0.35s_ease-out]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-line">
          <h2 className="font-serif text-lg tracking-wide">
            Shopping Bag ({itemCount})
          </h2>
          <button
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            className="p-1 hover:text-gold transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-smoke">
              <p className="text-sm">Your bag is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {state.items.map((item) => (
                <div key={`${item.product.id}-${item.size || ""}-${item.color || ""}`} className="flex gap-4 pb-5 border-b border-line">
                  <div className="w-20 h-24 bg-ivory flex-shrink-0">
                    <img
                      src={optimizeImage(item.product.images[0])}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm">{item.product.name}</h4>
                    {item.color && (
                      <p className="text-xs text-smoke mt-0.5">{item.color}</p>
                    )}
                    {item.size && (
                      <p className="text-xs text-smoke mt-0.5">Size: {item.size}</p>
                    )}
                    <p className="text-sm mt-1.5 font-medium">
                      ${item.product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() =>
                          dispatch({ type: "UPDATE_QTY", key: `${item.product.id}|${item.color || ""}|${item.size || ""}`, quantity: item.quantity - 1 })
                        }
                        className="w-6 h-6 flex items-center justify-center border border-line hover:bg-charcoal hover:text-paper hover:border-charcoal transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch({ type: "UPDATE_QTY", key: `${item.product.id}|${item.color || ""}|${item.size || ""}`, quantity: item.quantity + 1 })
                        }
                        className="w-6 h-6 flex items-center justify-center border border-line hover:bg-charcoal hover:text-paper hover:border-charcoal transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_ITEM", key: `${item.product.id}|${item.color || ""}|${item.size || ""}` })}
                        className="ml-auto p-1 text-smoke/40 hover:text-charcoal transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t border-line px-8 py-6">
            <div className="flex justify-between text-sm mb-5">
              <span className="text-smoke">Subtotal</span>
              <span className="font-medium">${total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-smoke/60 mb-5">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </Link>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-3 bg-[#25D366] border-[#25D366] hover:bg-[#1ea952] hover:border-[#1ea952] text-white flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Contact via WhatsApp
              </a>
            )}
            <button
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="text-xs text-smoke/50 underline underline-offset-4 hover:text-charcoal transition-colors w-full text-center mt-4"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
