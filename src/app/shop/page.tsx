"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products as defaultProducts, defaultSubcategories as seedSubs } from "@/lib/data";
import { ProductCategory, Product, ProductSubcategory } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DATA_MODE, LS, lsGet } from "@/lib/config";

const categories: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
];

const defaultSubcategories: ProductSubcategory[] = seedSubs as unknown as ProductSubcategory[];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function useProducts(): Product[] {
  const [items, setItems] = useState<Product[]>(defaultProducts);
  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<Product[]>(LS.products);
      if (stored && stored.length > 0) setItems(stored);
      return;
    }
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setItems(data.map((row: any) => ({
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
        })));
      }
    });
  }, []);
  return items;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeCat, setActiveCat] = useState<ProductCategory | "all">((searchParams.get("category") as ProductCategory | null) || "all");
  const [activeSub, setActiveSub] = useState<string>(searchParams.get("subcategory") || "");
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>(defaultSubcategories);

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<ProductSubcategory[]>(LS.subcategories);
      if (stored && stored.length > 0) setSubcategories(stored);
      return;
    }
    supabase.from("product_subcategories").select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setSubcategories(data.map((s: any) => ({ ...s, sortOrder: s.sort_order ?? 0 })) as ProductSubcategory[]);
      }
    });
  }, []);

  useEffect(() => {
    setActiveCat((searchParams.get("category") as ProductCategory | null) || "all");
    setActiveSub(searchParams.get("subcategory") || "");
  }, [searchParams]);

  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [showFilters, setShowFilters] = useState(false);

  const products = useProducts();

  const updateQuery = (cat: ProductCategory | "all", sub: string) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (sub) params.set("subcategory", sub);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const activeSubList = subcategories
    .filter((s) => s.category === activeCat)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const filtered = useMemo(() => {
    let result = activeCat === "all" ? [...products] : products.filter((p) => p.category === activeCat);
    if (activeCat !== "all" && activeSub) {
      result = result.filter((p) => p.subcategory === activeSub);
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === "newest") {
      result.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
    }
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [activeCat, activeSub, sort, priceRange, products]);

  const activeCatLabel = categories.find((c) => c.value === activeCat)?.label || "";

  return (
    <div className="page-padding py-14 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="section-label mb-2">Collection</p>
          <h1 className="section-title">Shop All</h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 text-xs tracking-label uppercase text-smoke">
          <SlidersHorizontal size={14} strokeWidth={1.5} /> Sort & Price
        </button>
      </div>

      {/* 主分类 Tab */}
      <div className="flex gap-1 mb-6 border-b border-line overflow-x-auto">
        {categories.map((c) => (
          <button key={c.value} onClick={() => { setActiveCat(c.value); setActiveSub(""); updateQuery(c.value, ""); }}
            className={`whitespace-nowrap px-4 py-2.5 text-xs tracking-label uppercase border-b-2 -mb-[1px] transition-colors ${activeCat === c.value ? "border-charcoal text-charcoal font-medium" : "border-transparent text-smoke hover:text-charcoal"}`}>{c.label}</button>
        ))}
      </div>

      {/* 子分类 chips */}
      {activeCat !== "all" && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => { setActiveSub(""); updateQuery(activeCat, ""); }}
            className={`px-3 py-1.5 text-xs border transition-colors ${activeSub === "" ? "border-charcoal bg-charcoal text-paper" : "border-line text-smoke hover:border-charcoal"}`}>All {activeCatLabel}</button>
          {activeSubList.map((s) => (
            <button key={s.id} onClick={() => { setActiveSub(s.id); updateQuery(activeCat, s.id); }}
              className={`px-3 py-1.5 text-xs border transition-colors ${activeSub === s.id ? "border-charcoal bg-charcoal text-paper" : "border-line text-smoke hover:border-charcoal"}`}>{s.name}</button>
          ))}
        </div>
      )}

      <div className="flex gap-12">
        <aside className={`${showFilters ? "fixed inset-0 z-40 bg-paper p-8 pt-24" : "hidden"} md:block md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0 md:w-52 flex-shrink-0`}>
          {showFilters && <button onClick={() => setShowFilters(false)} className="md:hidden absolute top-8 right-8"><X size={18} strokeWidth={1.5} /></button>}
          <div className="mb-10">
            <h3 className="text-[11px] tracking-label uppercase text-smoke/60 mb-4">Sort by</h3>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm bg-transparent border border-line px-3 py-2.5 w-full focus:outline-none focus:border-charcoal appearance-none cursor-pointer">
              {sortOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
          <div>
            <h3 className="text-[11px] tracking-label uppercase text-smoke/60 mb-4">Price</h3>
            <input type="range" min={0} max={600} step={10} value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-charcoal" />
            <div className="flex justify-between text-xs text-smoke/50 mt-2.5"><span>$0</span><span>Up to ${priceRange[1]}</span></div>
          </div>
        </aside>

        <div className="flex-1">
          <p className="text-xs text-smoke/50 tracking-label uppercase mb-6">{filtered.length} Products</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {filtered.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-24 text-smoke">
              <p className="mb-3">No products match your filters.</p>
              <button onClick={() => { setActiveCat("all"); setActiveSub(""); setPriceRange([0, 600]); updateQuery("all", ""); }} className="text-xs underline underline-offset-4 hover:text-charcoal">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopFallback() {
  return (
    <div className="page-padding py-14 md:py-20">
      <div className="mb-12">
        <h1 className="section-title">Shop All</h1>
      </div>
      <p className="text-smoke text-sm">Loading products...</p>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}
