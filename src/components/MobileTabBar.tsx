"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, LayoutGrid } from "lucide-react";
import { useCart } from "./CartContext";

// 移动端底部 Tab 栏 —— App 感核心组件（仅移动端显示）
export default function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, dispatch } = useCart();

  // 后台不显示底部栏
  if (pathname.startsWith("/admin")) return null;

  const tabs = [
    { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { href: "/shop", label: "Shop", icon: LayoutGrid, match: (p: string) => p.startsWith("/shop") || p.startsWith("/product") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-xl border-t border-line">
      <div className="flex items-stretch h-16">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] tracking-label uppercase transition-colors ${
                active ? "text-charcoal font-semibold" : "text-smoke/50"
              }`}
            >
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold" />}
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className={active ? "text-gold" : ""} />
              {t.label}
            </Link>
          );
        })}
        <button
          onClick={() => dispatch({ type: "TOGGLE_CART" })}
          className="relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] tracking-label uppercase text-smoke/50 transition-colors"
        >
          <span className="relative">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-paper text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {itemCount}
              </span>
            )}
          </span>
          Bag
        </button>
      </div>
    </nav>
  );
}
