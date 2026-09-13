import Link from "next/link";
import { Snowflake } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-paper/60">
      {/* 红细线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="page-padding py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl text-paper tracking-wide mb-5 flex items-center gap-2">
              MYCOAT<span className="text-gold text-[9px] -translate-y-2">•</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-sm text-paper/45 font-light">
              Premium down jackets and puffer coats. Filled with 90/10 European goose down, built with water-repellent shells, priced honestly.
            </p>
            <div className="flex items-center gap-2 text-[11px] tracking-label uppercase text-gold/70 mt-6">
              <Snowflake size={12} strokeWidth={1.5} />
              Warmth, engineered since 2026
            </div>
          </div>

          <div>
            <h4 className="text-[11px] tracking-label uppercase text-paper/35 mb-5">Shop</h4>
            <div className="flex flex-col gap-3 text-sm text-paper/45">
              <Link href="/shop" className="hover:text-paper hover:pl-1 transition-all duration-300">All Products</Link>
              <Link href="/shop?category=men" className="hover:text-paper hover:pl-1 transition-all duration-300">Men</Link>
              <Link href="/shop?category=women" className="hover:text-paper hover:pl-1 transition-all duration-300">Women</Link>
              <Link href="/shop?category=unisex" className="hover:text-paper hover:pl-1 transition-all duration-300">Unisex</Link>
              <Link href="/shop?category=women&subcategory=women_parka" className="hover:text-paper hover:pl-1 transition-all duration-300">Parkas</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] tracking-label uppercase text-paper/35 mb-5">Maison</h4>
            <div className="flex flex-col gap-3 text-sm text-paper/45">
              <Link href="/craft" className="hover:text-paper hover:pl-1 transition-all duration-300">Craftsmanship</Link>
              <Link href="/about" className="hover:text-paper hover:pl-1 transition-all duration-300">Our Story</Link>
              <a href="mailto:hello@mycoat.shop" className="hover:text-paper hover:pl-1 transition-all duration-300">hello@mycoat.shop</a>
            </div>
          </div>
        </div>

        <div className="border-t border-paper/10 mt-14 pt-8 flex flex-col md:flex-row justify-between gap-2 text-xs text-paper/25 tracking-label uppercase">
          <span>© {year} MYCOAT</span>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-paper/50 transition-colors">Admin</Link>
            <span className="flex items-center gap-1.5"><span className="text-gold">●</span> Worldwide shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
