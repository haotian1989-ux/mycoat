import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-server";

// 后台写操作统一入口（服务端使用 service role key 绕过 RLS）
const TABLE_MAP: Record<string, string> = {
  products: "products",
  product_subcategories: "product_subcategories",
  homepage_hero: "homepage_hero",
  homepage_sections: "homepage_sections",
  contact_links: "contact_links",
  about_page: "about_page",
  payment_settings: "payment_settings",
  orders: "orders",
};

function toSnake(obj: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    row[key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())] = val;
  }
  return row;
}

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
      video_url: obj.video ?? obj.video_url ?? "",
      in_stock: obj.inStock ?? obj.in_stock,
      featured: obj.featured,
      new_arrival: obj.newArrival ?? obj.new_arrival,
    };
  }
  if (table === "homepage_hero") {
    const row: Record<string, any> = { id: true };
    const map: Record<string, string> = {
      image: "image",
      tagline: "tagline",
      headline: "headline",
      subtext: "subtext",
      primaryBtnLabel: "primary_btn_label",
      secondaryBtnLabel: "secondary_btn_label",
      promiseTitle: "promise_title",
      promise1Title: "promise_1_title",
      promise1Text: "promise_1_text",
      promise2Title: "promise_2_title",
      promise2Text: "promise_2_text",
      promise3Title: "promise_3_title",
      promise3Text: "promise_3_text",
    };
    for (const [camel, snake] of Object.entries(map)) {
      row[snake] = obj[camel] ?? "";
    }
    return row;
  }
  if (table === "about_page" || table === "payment_settings") {
    return { id: true, ...toSnake(obj) };
  }
  return toSnake(obj);
}

export async function POST(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "服务端未配置 ADMIN_PASSWORD" }, { status: 500 });
  }
  if (pw !== expected) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.table !== "string" || typeof body.action !== "string") {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  const { table, action, data, id } = body;
  const dbTable = TABLE_MAP[table];
  if (!dbTable) return NextResponse.json({ error: "未知表" }, { status: 400 });

  try {
    const supabase = getAdminSupabase();

    if (action === "list") {
      const query = supabase.from(dbTable).select("*");
      if (dbTable === "orders") query.order("created_at", { ascending: false });
      const { data: rows, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data: rows });
    }

    if (action === "save_all") {
      await supabase.from(dbTable).delete().not("id", "is", null);
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
    } else {
      return NextResponse.json({ error: "未知操作" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
