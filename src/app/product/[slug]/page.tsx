import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";
import { products as defaultProducts } from "@/lib/data";
import { Product } from "@/lib/types";
import { DATA_MODE, SITE_URL, SITE_NAME } from "@/lib/config";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const BASE = SITE_URL;

function mapRow(row: any): Product {
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

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // 本地模式：直接查种子数据
  if (DATA_MODE === "local") {
    return defaultProducts.find((p) => p.slug === slug) || null;
  }
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data) return mapRow(data);
  } catch (e: any) {
    console.error("[product] fetch failed:", e?.message || e);
  }
  return defaultProducts.find((p) => p.slug === slug) || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  const description = product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.name} — premium down wear by ${SITE_NAME}.`;
  const images = product.images.length > 0 ? product.images.slice(0, 3) : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `${BASE}/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `${BASE}/product/${product.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
