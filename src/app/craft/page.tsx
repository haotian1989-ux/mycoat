import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Craft",
  description:
    "Discover how MYCOAT jackets are made: 90/10 European goose down, water-repellent shells, and precise quilting craftsmanship.",
  alternates: { canonical: "https://www.mycoat.shop/craft" },
};

const CRAFT = {
  heroImage: "/products/mens-navy-long.jpg",
  heroTagline: "Craftsmanship",
  heroTitle: "Engineered for Winter",
  intro:
    "Every MYCOAT piece is built around one question: how warm can a jacket be at an honest price? The answer is in the materials — the same specifications used by alpine houses, without the markup.",
  blocks: [
    {
      id: "down",
      title: "90/10 Goose Down",
      description: "European grey goose down with 700+ fill power. Exceptional warmth-to-weight, ethically sourced.",
      image: "/products/mens-black-puffer.jpg",
    },
    {
      id: "shell",
      title: "Water-Repellent Shells",
      description: "DWR-coated nylon shells that shed rain and block wind, with YKK hardware throughout.",
      image: "/products/mens-black-packable.jpg",
    },
    {
      id: "quilt",
      title: "Precision Quilting",
      description: "Baffle quilting keeps down evenly distributed — no cold spots, no shifting, season after season.",
      image: "/products/womens-camel-parka.jpg",
    },
    {
      id: "fit",
      title: "Considered Fits",
      description: "Short, long, oversized and packable silhouettes — designed to layer and built to last.",
      image: "/products/womens-red-hooded.jpg",
    },
  ],
};

export default function CraftPage() {
  return (
    <>
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-charcoal/55 z-10" />
        <img src={CRAFT.heroImage} alt="Craftsmanship" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 page-padding">
          <p className="section-label mb-3 text-gold">{CRAFT.heroTagline}</p>
          <h1 className="font-serif text-display text-paper">{CRAFT.heroTitle}</h1>
        </div>
      </section>

      <section className="page-padding py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="text-center body-text max-w-2xl mx-auto mb-20">{CRAFT.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {CRAFT.blocks.map((b) => (
              <div key={b.id} className="group relative aspect-[4/5] overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                  <h2 className="font-serif text-2xl md:text-3xl text-paper mb-2">{b.title}</h2>
                  <p className="text-sm text-paper/60 max-w-xs">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-padding py-24 bg-ivory/30 text-center">
        <p className="section-label mb-3">The Collection</p>
        <h2 className="section-title mb-4">Warmth, Refined.</h2>
        <p className="body-text max-w-md mx-auto mb-8">
          Eight signature pieces, from $149. Shipping quoted on request.
        </p>
        <Link href="/shop" className="btn-primary">Shop the Collection</Link>
      </section>
    </>
  );
}
