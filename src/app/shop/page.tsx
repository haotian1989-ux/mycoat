import { getServerSupabase } from "@/lib/supabase-server";
import ShopClient from "./ShopClient";
import { Product, ProductSubcategory } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

function mapRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    subcategory: row.subcategory || "",
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

export default async function ShopPage() {
  let products: Product[] = [];
  let subcategories: ProductSubcategory[] = [];

  try {
    const supabase = getServerSupabase();
    const { data: productRows } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (productRows) products = productRows.map(mapRow);

    const { data: subRows } = await supabase
      .from("product_subcategories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (subRows) {
      subcategories = subRows.map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        sortOrder: s.sort_order ?? 0,
      })) as ProductSubcategory[];
    }
  } catch (e) {
    console.error("[shop] server fetch failed:", e);
  }

  return <ShopClient initialProducts={products} initialSubcategories={subcategories} />;
}
