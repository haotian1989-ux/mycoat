"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { optimizeImage } from "@/lib/image";
import { DATA_MODE, LS, lsGet } from "@/lib/config";
import { Snowflake, Feather, ShieldCheck, Globe } from "lucide-react";


interface PromiseItem {
  title: string;
  text: string;
}

interface Props {
  heroImage: string;
  heroTagline: string;
  heroHeadline: string;
  heroSubtext: string;
  heroPrimaryBtn: string;
  heroSecondaryBtn: string;
  promiseTitle: string;
  promiseItems: PromiseItem[];
  sections: any[];
  products: Product[];
}

const trustPoints = [
  { icon: Feather, label: "90/10 Goose Down" },
  { icon: Snowflake, label: "700+ Fill Power" },
  { icon: ShieldCheck, label: "Water-Repellent" },
  { icon: Globe, label: "Worldwide Shipping" },
];

export default function HomeClient({
  heroImage, heroTagline, heroHeadline, heroSubtext,
  heroPrimaryBtn, heroSecondaryBtn,
  promiseTitle, promiseItems,
  sections, products,
}: Props) {
  // 本地模式：后台编辑后前台即时生效（读 localStorage 覆盖默认值）
  const [hero, setHero] = useState({ heroImage, heroTagline, heroHeadline, heroSubtext, heroPrimaryBtn, heroSecondaryBtn, promiseTitle, promiseItems });
  const [cats, setCats] = useState(sections);
  const [list, setList] = useState(products);

  useEffect(() => {
    if (DATA_MODE !== "local") return;
    const storedHero = lsGet<any>(LS.hero);
    if (storedHero) {
      setHero((h) => ({
        ...h,
        heroImage: storedHero.image || h.heroImage,
        heroTagline: storedHero.tagline || h.heroTagline,
        heroHeadline: storedHero.headline || h.heroHeadline,
        heroSubtext: storedHero.subtext || h.heroSubtext,
        heroPrimaryBtn: storedHero.primaryBtnLabel || storedHero.primary_btn_label || h.heroPrimaryBtn,
        heroSecondaryBtn: storedHero.secondaryBtnLabel || storedHero.secondary_btn_label || h.heroSecondaryBtn,
        promiseTitle: storedHero.promiseTitle || h.promiseTitle,
        promiseItems: [
          { title: storedHero.promise1Title || h.promiseItems[0].title, text: storedHero.promise1Text || h.promiseItems[0].text },
          { title: storedHero.promise2Title || h.promiseItems[1].title, text: storedHero.promise2Text || h.promiseItems[1].text },
          { title: storedHero.promise3Title || h.promiseItems[2].title, text: storedHero.promise3Text || h.promiseItems[2].text },
        ],
      }));
    }
    const storedSections = lsGet<any[]>(LS.sections);
    if (storedSections && storedSections.length > 0) setCats(storedSections);
    const storedProducts = lsGet<Product[]>(LS.products);
    if (storedProducts && storedProducts.length > 0) setList(storedProducts);
  }, []);

  const featured = list.filter((p) => p.featured);
  const newArrivals = list.filter((p) => p.newArrival);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[92vh] min-h-[680px] flex items-center overflow-hidden bg-night">
        {/* 暗调氛围渐变 */}
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/60 to-night/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/30 z-10" />
        {hero.heroImage && <img src={optimizeImage(hero.heroImage)} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />}

        <div className="relative z-20 page-padding w-full">
          <div className="max-w-2xl animate-floatIn">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-gold" />
              <p className="section-label">{hero.heroTagline}</p>
            </div>
            <h1 className="font-serif text-display text-paper mb-8 text-balance whitespace-pre-line">
              {hero.heroHeadline}
            </h1>
            <p className="text-paper/65 text-base md:text-lg leading-relaxed mb-10 max-w-md font-light">
              {hero.heroSubtext}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary bg-paper text-charcoal hover:bg-gold hover:text-paper border-0">
                {hero.heroPrimaryBtn || 'Explore Collection'}
              </Link>
              <Link href="/craft" className="btn-outline border-paper/30 text-paper hover:bg-paper/10 hover:border-paper/50">
                {hero.heroSecondaryBtn || 'Our Craft'}
              </Link>
            </div>
          </div>
        </div>

        {/* 底部信任条 */}
        <div className="absolute bottom-0 inset-x-0 z-20 border-t border-paper/10 bg-night/60 backdrop-blur-md">
          <div className="page-padding py-5 flex items-center justify-between gap-6 overflow-x-auto">
            {trustPoints.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5 text-paper/60 whitespace-nowrap">
                <t.icon size={15} strokeWidth={1.5} className="text-gold/80" />
                <span className="text-[10px] tracking-label uppercase">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="page-padding py-20 md:py-32">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <p className="section-label">Just Landed</p>
                <span className="h-px w-10 bg-gold/40" />
              </div>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link href="/shop" className="hidden md:block btn-ghost">View All →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-20 md:py-32 bg-ivory/60">
          <div className="page-padding">
            <div className="flex items-center gap-4 mb-3">
              <p className="section-label">Curated Selection</p>
              <span className="h-px w-10 bg-gold/40" />
            </div>
            <h2 className="section-title mb-14">Featured Pieces</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {featured.map((p) => (<ProductCard key={p.id} product={p} />))}
            </div>
          </div>
        </section>
      )}

      {/* Collections */}
      {cats.length > 0 && (
        <section className="page-padding py-20 md:py-32">
          <h2 className="section-title text-center mb-4">Our Collections</h2>
          <p className="text-center text-smoke text-sm mb-14 max-w-md mx-auto">
            Built for the mountain, worn everywhere.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {cats.map((sec: any, i: number) => (
              <Link key={i} href={sec.link || "#"} className="group relative aspect-[4/5] overflow-hidden bg-ivory/50">
                {sec.image && <img src={optimizeImage(sec.image)} alt={sec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />}
                <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-transparent to-transparent flex items-end p-8">
                  <div>
                    <span className="block h-px w-8 bg-gold mb-3 transition-all duration-500 group-hover:w-14" />
                    <h3 className="font-serif text-2xl md:text-3xl text-paper tracking-wide">{sec.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promise */}
      <section className="bg-night text-paper py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-10 right-10 text-gold/10">
          <Snowflake size={180} strokeWidth={0.5} />
        </div>
        <div className="page-padding max-w-5xl mx-auto text-center relative">
          <p className="section-label mb-8">{hero.promiseTitle}</p>
          <h2 className="font-serif text-heading mb-16 text-balance">
            Warmth, engineered.<br /><span className="font-sans italic font-light text-paper/70 text-xl md:text-2xl">Worn everywhere.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {hero.promiseItems.map((item, i) => (
              <div key={i} className="border-t border-paper/10 pt-8">
                <span className="font-serif text-2xl text-gold/80 block mb-4">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-serif text-lg text-paper mb-3">{item.title}</h3>
                <p className="text-sm text-paper/45 leading-relaxed font-light">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping CTA */}
      <section className="page-padding py-20 md:py-28 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="h-px w-10 bg-gold/40" />
          <p className="section-label">Easy Shopping</p>
          <span className="h-px w-10 bg-gold/40" />
        </div>
        <h2 className="section-title mb-6">Free Shipping Over $200</h2>
        <p className="body-text max-w-xl mx-auto mb-10">
          Worldwide delivery with full tracking. 30-day returns, no questions asked. Pay with PayPal or USDT.
        </p>
        <Link href="/shop" className="btn-primary">Shop the Collection</Link>
      </section>
    </>
  );
}
