import type { MetadataRoute } from "next";
import { getServiceSupabase } from "@/lib/supabase-server";
import { products as defaultProducts } from "@/lib/data";
import { DATA_MODE, SITE_URL } from "@/lib/config";

const BASE = SITE_URL;

const staticPaths = [
  "/shop",
  "/craft",
  "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[] = defaultProducts.map((p) => p.slug);
  if (DATA_MODE === "supabase") {
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase.from("products").select("slug");
      if (!error && data && data.length > 0) {
        slugs = data.map((row: any) => row.slug).filter(Boolean);
      }
    } catch (e: any) {
      console.error("[sitemap] products fetch failed:", e?.message || e);
    }
  }

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...staticPaths.map((path) => ({
      url: BASE + path,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${BASE}/product/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return entries;
}
