import { Product } from "./types";

// MYCOAT 产品数据
// 真实产品全部存储在 Supabase products 表（40+ 款）。
// 这里保留空数组作为极端兜底（Supabase 完全不可用时），
// 早期 8 款占位示例已全部移除，避免旧示例 URL 被 fallback 渲染。
export const products: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(cat: Product["category"]): Product[] {
  return products.filter((p) => p.category === cat);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.newArrival);
}

// 默认子分类（男装 / 女装）
export const defaultSubcategories = [
  { id: "men_short", name: "Short Down", category: "men", sortOrder: 0 },
  { id: "men_long", name: "Long Down", category: "men", sortOrder: 1 },
  { id: "men_vest", name: "Vests", category: "men", sortOrder: 2 },
  { id: "women_short", name: "Short Down", category: "women", sortOrder: 0 },
  { id: "women_long", name: "Long Down", category: "women", sortOrder: 1 },
  { id: "women_parka", name: "Parkas", category: "women", sortOrder: 2 },
] as const;
