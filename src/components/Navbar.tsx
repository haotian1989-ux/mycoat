"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, MessageCircle, ChevronDown, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { ProductSubcategory } from "@/lib/types";
import { DATA_MODE, LS, lsGet } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { defaultSubcategories } from "@/lib/data";

const categories = [
  { href: "/shop?category=men", label: "Men", key: "men" },
  { href: "/shop?category=women", label: "Women", key: "women" },
];

const notices = [
  "Free worldwide shipping over $200",
  "90/10 European goose down · 700+ fill power",
  "Pay with PayPal or USDT",
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [subcats, setSubcats] = useState<ProductSubcategory[]>(defaultSubcategories as any);
  const { itemCount, dispatch } = useCart();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<ProductSubcategory[]>(LS.subcategories);
      if (stored && stored.length > 0) setSubcats(stored);
      return;
    }
    supabase.from("product_subcategories").select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setSubcats(data.map((s: any) => ({ ...s, sortOrder: s.sort_order ?? 0 })) as ProductSubcategory[]);
      }
    });
  }, []);

  const subOf = (cat: string) => subcats.filter((s) => s.category === cat).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <header className="sticky top-0 z-50">
      {/* 顶部通知条（后台隐藏） */}
      {!isAdmin && (
        <div className="bg-charcoal text-paper/80 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee py-2 text-[10px] tracking-label uppercase">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {notices.map((n, i) => (
                  <span key={i} className="flex items-center gap-6 px-8">
                    <Snowflake size={11} strokeWidth={1.5} className="text-gold" />
                    {n}
                    <Snowflake size={11} strokeWidth={1.5} className="text-gold" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-paper/90 backdrop-blur-xl border-b border-line/60">
        <nav className="page-padding flex items-center justify-between h-16 md:h-[76px]">
          <button
            className="md:hidden p-2 -ml-2 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-serif text-xl md:text-[24px] tracking-extra uppercase flex items-center gap-1.5"
          >
            MYCOAT<span className="text-gold text-[8px] -translate-y-2">•</span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-[11px] tracking-label uppercase text-charcoal hover:text-gold transition-colors py-1.5 font-semibold">Home</Link>
            <Link href="/shop" className="text-[11px] tracking-label uppercase text-smoke hover:text-charcoal transition-colors duration-300 relative group">
              Shop
              <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-gold transition-all duration-300" />
            </Link>
            {categories.map((c) => (
              <div key={c.key} className="relative group">
                <Link href={c.href} className="flex items-center gap-1 text-[11px] tracking-label uppercase text-smoke hover:text-charcoal transition-colors duration-300 py-1.5">
                  {c.label}
                  <ChevronDown size={12} strokeWidth={1.5} className="transition-transform duration-200 group-hover:rotate-180" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                  <div className="bg-paper border border-line shadow-xl shadow-charcoal/5 py-2 min-w-[190px]">
                    <Link href={c.href} className="block px-5 py-2.5 text-[11px] tracking-label uppercase text-gold hover:bg-ivory/60 transition-colors">
                      View all {c.label}
                    </Link>
                    {subOf(c.key).map((s) => (
                      <Link key={s.id} href={`/shop?category=${c.key}&subcategory=${s.id}`} className="block px-5 py-2.5 text-sm text-charcoal/80 hover:bg-ivory/60 hover:text-gold transition-colors">
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Link href="/craft" className="text-[11px] tracking-label uppercase text-smoke hover:text-charcoal transition-colors duration-300 relative group">
              Craft
              <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-gold transition-all duration-300" />
            </Link>
            <Link href="/about" className="text-[11px] tracking-label uppercase text-smoke hover:text-charcoal transition-colors duration-300 relative group">
              Our Story
              <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-gold transition-all duration-300" />
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const btn = document.querySelector('[aria-label="Contact us"]') as HTMLButtonElement;
                if (btn) btn.click();
              }}
              className="hidden md:flex items-center gap-1.5 text-[11px] tracking-label uppercase text-smoke hover:text-charcoal transition-colors duration-300 mr-2"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
              Contact
            </a>

            <button
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
              className="relative p-2 text-charcoal"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-paper text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-paper">
          <div className="page-padding py-5 flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm tracking-label uppercase text-charcoal hover:text-gold transition-colors py-1.5 font-semibold">Home</Link>
            <Link href="/shop" onClick={() => setMobileOpen(false)} className="text-sm tracking-label uppercase text-smoke hover:text-charcoal transition-colors py-1.5">Shop All</Link>

            {categories.map((c) => {
              const isOpen = openCat === c.key;
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between">
                    <Link href={c.href} onClick={() => setMobileOpen(false)} className="flex-1 text-sm tracking-label uppercase text-smoke hover:text-charcoal transition-colors py-1.5">
                      {c.label}
                    </Link>
                    <button onClick={() => setOpenCat(isOpen ? null : c.key)} aria-label={`Toggle ${c.label}`} className="p-2 -mr-2 text-smoke hover:text-charcoal">
                      <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="pl-4 mt-1 mb-2 flex flex-col gap-1 border-l-2 border-gold/30">
                      <Link href={c.href} onClick={() => setMobileOpen(false)} className="text-[12px] tracking-label uppercase text-gold hover:text-charcoal py-1.5">View all {c.label}</Link>
                      {subOf(c.key).map((s) => (
                        <Link key={s.id} href={`/shop?category=${c.key}&subcategory=${s.id}`} onClick={() => setMobileOpen(false)} className="text-sm text-charcoal/80 hover:text-charcoal py-1.5">
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/craft" onClick={() => setMobileOpen(false)} className="text-sm tracking-label uppercase text-smoke hover:text-charcoal transition-colors py-1.5">Craft</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="text-sm tracking-label uppercase text-smoke hover:text-charcoal transition-colors py-1.5">Our Story</Link>

            <div className="pt-3 border-t border-line mt-1">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => {
                    const btn = document.querySelector('[aria-label="Contact us"]') as HTMLButtonElement;
                    if (btn) btn.click();
                  }, 100);
                }}
                className="flex items-center gap-2 text-sm tracking-label uppercase text-smoke hover:text-charcoal transition-colors py-1.5 w-full text-left"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
