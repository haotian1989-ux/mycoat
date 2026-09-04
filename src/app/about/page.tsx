import type { Metadata } from "next";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase-server";
import { DATA_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The MYCOAT story: 90/10 goose down, water-repellent shells, honest prices. Premium down wear built for real winters.",
  alternates: { canonical: "https://www.mycoat.shop/about" },
};

const DEFAULT_ABOUT = {
  heroImage: "/products/womens-camel-parka.jpg",
  heroTagline: "Since 2026",
  heroTitle: "Our Story",
  section1Label: "Philosophy",
  section1Heading: "Luxury warmth.\nHonest price.",
  section1Text: "At MYCOAT, we believe winter outerwear should be judged by one thing: how well it keeps you warm. We use the same 90/10 European goose down, water-repellent shells and YKK hardware found on jackets three times the price — and skip everything that doesn't keep you warm.",
  section1Image: "/products/mens-black-puffer.jpg",
  section2Label: "Materials",
  section2Heading: "Specs first, always.",
  section2Text: "700+ fill power down. DWR-coated nylon. Reinforced quilting. Every specification is published on every product page — because when the materials are right, we don't need to hide anything.",
  section2Image: "/products/womens-silver-matte.jpg",
  ctaText: "Shop the Collection",
  ctaLink: "/shop",
};

async function fetchAboutData() {
  if (DATA_MODE === "local") return DEFAULT_ABOUT;
  const supabase = getServiceSupabase();
  try {
    const { data, error } = await supabase.from("about_page").select("*").limit(1).maybeSingle();
    if (error) {
      console.error("[about] query error:", error.message);
      return DEFAULT_ABOUT;
    }
    const row: any = data;
    if (!row) return DEFAULT_ABOUT;
    return {
      heroImage: row.hero_image || DEFAULT_ABOUT.heroImage,
      heroTagline: row.hero_tagline || DEFAULT_ABOUT.heroTagline,
      heroTitle: row.hero_title || DEFAULT_ABOUT.heroTitle,
      section1Label: row.section1_label || DEFAULT_ABOUT.section1Label,
      section1Heading: row.section1_heading || DEFAULT_ABOUT.section1Heading,
      section1Text: row.section1_text || DEFAULT_ABOUT.section1Text,
      section1Image: row.section1_image || DEFAULT_ABOUT.section1Image,
      section2Label: row.section2_label || DEFAULT_ABOUT.section2Label,
      section2Heading: row.section2_heading || DEFAULT_ABOUT.section2Heading,
      section2Text: row.section2_text || DEFAULT_ABOUT.section2Text,
      section2Image: row.section2_image || DEFAULT_ABOUT.section2Image,
      ctaText: row.cta_text || DEFAULT_ABOUT.ctaText,
      ctaLink: row.cta_link || DEFAULT_ABOUT.ctaLink,
    };
  } catch (err: any) {
    console.error("[about] fatal error:", err?.message || err);
    return DEFAULT_ABOUT;
  }
}

export default async function AboutPage() {
  const c = await fetchAboutData();

  return (
    <>
      <section className="relative h-[55vh] min-h-[420px] flex items-center">
        <div className="absolute inset-0 bg-charcoal/55 z-10" />
        {c.heroImage && <img src={c.heroImage} alt="Maison" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="relative z-20 page-padding">
          <p className="section-label mb-3 text-gold">{c.heroTagline}</p>
          <h1 className="font-serif text-display text-paper">{c.heroTitle}</h1>
        </div>
      </section>

      <section className="page-padding py-20 md:py-28 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-24">
          <div>
            <p className="section-label mb-4">{c.section1Label}</p>
            <h2 className="font-serif text-heading mb-6 whitespace-pre-line">{c.section1Heading}</h2>
            <p className="body-text whitespace-pre-line">{c.section1Text}</p>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            {c.section1Image && <img src={c.section1Image} alt="Down" className="w-full h-full object-cover" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-24">
          <div className="aspect-[4/5] overflow-hidden md:order-1 order-2">
            {c.section2Image && <img src={c.section2Image} alt="Materials" className="w-full h-full object-cover" />}
          </div>
          <div className="md:order-2 order-1">
            <p className="section-label mb-4">{c.section2Label}</p>
            <h2 className="font-serif text-heading mb-6 whitespace-pre-line">{c.section2Heading}</h2>
            <p className="body-text whitespace-pre-line">{c.section2Text}</p>
          </div>
        </div>

        <div className="text-center">
          <Link href={c.ctaLink || "/shop"} className="btn-primary">{c.ctaText || "Shop the Collection"}</Link>
        </div>
      </section>
    </>
  );
}
