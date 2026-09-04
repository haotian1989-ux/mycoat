import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

// 云模式下由客户端评论提交调用（本地模式不走此路由）
const TABLE_MAP: Record<string, string> = {
  products: "products",
  product_subcategories: "product_subcategories",
  craft: "craft_pages",
  homepage_hero: "homepage_hero",
  homepage_sections: "homepage_sections",
  contact: "contact_links",
  reviews: "reviews",
  orders: "orders",
};

function toSnakeRow(obj: Record<string, any>, table: string): Record<string, any> {
  if (table === "products") {
    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      category: obj.category,
      subcategory: obj.subcategory ?? "",
      price: obj.price,
      description: obj.description,
      details: obj.details,
      materials: obj.materials,
      dimensions: obj.dimensions,
      colors: obj.colors,
      sizes: obj.sizes,
      images: obj.images,
      in_stock: obj.inStock,
      featured: obj.featured,
      new_arrival: obj.newArrival,
    };
  }
  if (table === "reviews") {
    return { id: obj.id, product_id: obj.product_id ?? obj.productId, author: obj.author, rating: obj.rating, title: obj.title, content: obj.content };
  }
  return obj;
}

export async function POST(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  if (pw !== "mycoat2026") {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const { table, action, data, id } = await req.json();
  const dbTable = TABLE_MAP[table];
  if (!dbTable) return NextResponse.json({ error: "未知表" }, { status: 400 });

  try {
    const supabase = getServiceSupabase();
    if (action === "save_all") {
      await supabase.from(dbTable).delete().neq("id", "__never_match__");
      if (Array.isArray(data) && data.length > 0) {
        const rows = data.map((d: any) => toSnakeRow(d, dbTable));
        const { error } = await supabase.from(dbTable).insert(rows);
        if (error) throw error;
      }
    } else if (action === "add") {
      const { error } = await supabase.from(dbTable).insert(toSnakeRow(data, dbTable));
      if (error) throw error;
    } else if (action === "update") {
      const { error } = await supabase.from(dbTable).update(toSnakeRow(data, dbTable)).eq("id", id);
      if (error) throw error;
    } else if (action === "delete") {
      const { error } = await supabase.from(dbTable).delete().eq("id", id);
      if (error) throw error;
    } else if (action === "upsert") {
      const { error } = await supabase.from(dbTable).upsert(toSnakeRow(data, dbTable));
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
