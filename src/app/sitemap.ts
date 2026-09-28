import type { MetadataRoute } from "next";
import { getServerSupabase } from "@/lib/supabase-server";
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
  let blogSlugs: string[] = [];
  if (DATA_MODE === "supabase") {
    try {
      const supabase = getServerSupabase();
      const { data, error } = await supabase.from("products").select("slug");
      if (!error && data && data.length > 0) {
        slugs = data.map((row: any) => row.slug).filter(Boolean);
      }
      const { data: blogData, error: blogError } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("published", true);
      if (!blogError && blogData) {
        blogSlugs = blogData.map((row: any) => row.slug).filter(Boolean);
      }
    } catch (e: any) {
      console.error("[sitemap] fetch failed:", e?.message || e);
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
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
    ...blogSlugs.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
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
