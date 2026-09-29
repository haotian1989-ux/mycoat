import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getServerSupabase } from "@/lib/supabase-server";
import { products as defaultProducts } from "@/lib/data";
import { DATA_MODE, SITE_URL } from "@/lib/config";

const BASE = SITE_URL;

// 动态生成：每次请求实时查询，确保新建的博客/商品立即进入 sitemap
export const dynamic = "force-dynamic";
export const revalidate = 0;

const staticPaths = [
  "/shop",
  "/craft",
  "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  headers(); // 强制每次请求动态生成，避免 sitemap 被静态快照
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
