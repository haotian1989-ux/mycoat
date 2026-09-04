// MYCOAT 站点配置
// DATA_MODE:
//   - "local"    本地模式：数据存 localStorage，无需任何账号即可完整运行（演示/开发）
//   - "supabase" 云模式：数据存 Supabase，所有设备共享（上线前在 .env.local 配置好并切换）
export const DATA_MODE: "local" | "supabase" =
  (process.env.NEXT_PUBLIC_DATA_MODE as "local" | "supabase") || "local";

export const SITE_NAME = "MYCOAT";
export const SITE_URL = "https://www.mycoat.shop";

// localStorage 键统一管理（本地模式使用）
export const LS = {
  products: "mycoat_products",
  subcategories: "mycoat_subcategories",
  hero: "mycoat_hero",
  sections: "mycoat_sections",
  contact: "mycoat_contact",
  orders: "mycoat_orders",
  reviews: "mycoat_reviews",
  payment: "mycoat_payment",
  cart: "mycoat_cart",
};

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}
