import type { Metadata } from "next";
import { getServerSupabase } from "@/lib/supabase-server";
import { DATA_MODE, SITE_URL, SITE_NAME } from "@/lib/config";
import { products as seedProducts } from "@/lib/data";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | Luxury Down Jackets` },
  description:
    "Premium down jackets and puffer coats. 90/10 European goose down, water-repellent shells, honest prices.",
  alternates: { canonical: SITE_URL },
};

const DEFAULT_SECTIONS = [
  { title: "Men", description: "Short, long and packable down for men", image: "/products/mens-black-puffer.jpg", link: "/shop?category=men", sort_order: 0 },
  { title: "Women", description: "Puffers and parkas for women", image: "/products/womens-camel-parka.jpg", link: "/shop?category=women", sort_order: 1 },
  { title: "The Craft", description: "90/10 goose down, water-repellent shells", image: "/products/mens-navy-long.jpg", link: "/craft", sort_order: 2 },
];

const DEFAULT_HERO = {
  heroImage: "/products/mens-black-puffer.jpg",
  heroTagline: "Maison · Est. 2026",
  heroHeadline: "Warmth,\nRefined.",
  heroSubtext: "Premium down jackets filled with 90/10 European goose down. Water-repellent shells, honest prices from $149.",
  heroPrimaryBtn: "Explore Collection",
  heroSecondaryBtn: "Our Craft",
  promiseTitle: "The MYCOAT Promise",
  promiseItems: [
    { title: "90/10 Goose Down", text: "European grey goose down with 700+ fill power — the same specification used by luxury alpine houses, at an honest price." },
    { title: "Weatherproof Shells", text: "Every jacket uses a water-repellent, windproof shell with YKK hardware. Built for real winters, not just looks." },
    { title: "30-Day Returns", text: "Hassle-free 30-day returns. We stand behind every piece. Shipping cost is quoted by our team." },
  ],
};

function mapProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    description: row.description || "",
    details: row.details || [],
    materials: row.materials || "",
    dimensions: row.dimensions || "",
    colors: row.colors || [],
    sizes: row.sizes || [],
    images: row.images || [],
    video: row.video_url || "",
    inStock: row.in_stock,
    featured: row.featured,
    newArrival: row.new_arrival,
    createdAt: row.created_at,
  };
}

async function fetchHomeData() {
  // 本地模式：直接返回种子数据（Supabase 配置后自动切换云模式）
  if (DATA_MODE === "local") {
    return {
      ...DEFAULT_HERO,
      sections: DEFAULT_SECTIONS,
      products: seedProducts,
    };
  }

  const supabase = getServerSupabase();

  try {
    const [heroResult, productsResult, sectionsResult] = await Promise.all([
      supabase.from("homepage_hero").select("*").limit(1).maybeSingle(),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("homepage_sections").select("*").order("sort_order"),
    ]);

    const heroRow = heroResult.data;
    const products = productsResult.data;
    const sections = sectionsResult.data;

    if (sectionsResult.error) {
      console.error("[fetchHomeData] sections query error:", sectionsResult.error.message);
    }

    const image = heroRow?.image || DEFAULT_HERO.heroImage;

    const mappedProducts = (products || []).map(mapProduct);

    const promiseTitle = heroRow?.promise_title || DEFAULT_HERO.promiseTitle;
    const promiseItems = [
      { title: heroRow?.promise_1_title || DEFAULT_HERO.promiseItems[0].title, text: heroRow?.promise_1_text || DEFAULT_HERO.promiseItems[0].text },
      { title: heroRow?.promise_2_title || DEFAULT_HERO.promiseItems[1].title, text: heroRow?.promise_2_text || DEFAULT_HERO.promiseItems[1].text },
      { title: heroRow?.promise_3_title || DEFAULT_HERO.promiseItems[2].title, text: heroRow?.promise_3_text || DEFAULT_HERO.promiseItems[2].text },
    ];

    return {
      heroImage: image,
      heroTagline: heroRow?.tagline || DEFAULT_HERO.heroTagline,
      heroHeadline: heroRow?.headline || DEFAULT_HERO.heroHeadline,
      heroSubtext: heroRow?.subtext || DEFAULT_HERO.heroSubtext,
      heroPrimaryBtn: heroRow?.primary_btn_label || DEFAULT_HERO.heroPrimaryBtn,
      heroSecondaryBtn: heroRow?.secondary_btn_label || DEFAULT_HERO.heroSecondaryBtn,
      promiseTitle,
      promiseItems,
      sections: (sections && sections.length > 0) ? sections : DEFAULT_SECTIONS,
      products: mappedProducts.length > 0 ? mappedProducts : seedProducts,
    };
  } catch (err: any) {
    console.error("[fetchHomeData] fatal error:", err.message || err);
    return {
      ...DEFAULT_HERO,
      sections: DEFAULT_SECTIONS,
      products: seedProducts,
    };
  }
}

export default async function HomePage() {
  const data = await fetchHomeData();
  return <HomeClient {...data} />;
}
