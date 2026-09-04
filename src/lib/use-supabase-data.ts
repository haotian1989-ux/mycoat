"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { DATA_MODE, LS, lsGet, lsSet } from "./config";

const TABLE_LS_KEY: Record<string, string> = {
  products: LS.products,
  product_subcategories: LS.subcategories,
  homepage_hero: LS.hero,
  homepage_sections: LS.sections,
  contact_links: LS.contact,
  orders: LS.orders,
  reviews: LS.reviews,
  about_page: "mycoat_about",
};

function lsKeyFor(table: string): string {
  return TABLE_LS_KEY[table] || `mycoat_${table}`;
}

const CAMEL_FIELD_MAP: Record<string, string> = {
  description: "desc",
  hermes_equivalent: "hermesEquivalent",
  best_for: "bestFor",
  base_price: "basePrice",
  swatch_image: "swatchImage",
  video_url: "video",
};

function snakeToCamel(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  const out: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (CAMEL_FIELD_MAP[key]) {
      out[CAMEL_FIELD_MAP[key]] = val;
    } else {
      const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = val;
    }
  }
  return out;
}

function toSnakeCase(obj: any): any {
  const row: any = {};
  for (const [key, val] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
    row[snake] = val;
  }
  return row;
}

function toProductRow(obj: any): any {
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
    images: obj.images,
    video_url: obj.video ?? obj.video_url ?? "",
    in_stock: obj.inStock ?? obj.in_stock,
    featured: obj.featured,
    new_arrival: obj.newArrival ?? obj.new_arrival,
  };
}

// ── List hook (products, builder data) ──
export function useAdminSupabaseList<T extends { id: string }>(table: string, defaults: T[]) {
  const [items, setItems] = useState<T[]>(defaults);
  const [loaded, setLoaded] = useState(false);
  const key = lsKeyFor(table);

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<T[]>(key);
      if (stored && stored.length > 0) setItems(stored);
      else lsSet(key, defaults);
      setLoaded(true);
      return;
    }
    supabase.from(table).select("*").then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        if (table === "products") {
          setItems(data.map((row: any) => ({ ...row, inStock: row.in_stock, newArrival: row.new_arrival })) as T[]);
        } else {
          setItems(data.map(snakeToCamel) as T[]);
        }
      }
      setLoaded(true);
    });
  }, [table, key, defaults]);

  const saveAll = useCallback(async (newItems: T[]): Promise<string | null> => {
    setItems(newItems);
    if (DATA_MODE === "local") {
      lsSet(key, newItems);
      return null;
    }
    try {
      await supabase.from(table).delete().not("id", "is", null);
      if (newItems.length > 0) {
        const rows = newItems.map((item) => {
          if (table === "products") {
            return toProductRow(item);
          }
          return toSnakeCase(item);
        });
        const { error } = await supabase.from(table).insert(rows);
        if (error) return error.message;
      }
      return null;
    } catch (e: any) { return e.message || "保存失败"; }
  }, [table, key]);

  const add = useCallback(async (item: T): Promise<string | null> => {
    const next = [...items, item];
    setItems(next);
    if (DATA_MODE === "local") {
      lsSet(key, next);
      return null;
    }
    try {
      const row = table === "products" ? toProductRow(item) : toSnakeCase(item);
      const { error } = await supabase.from(table).insert(row);
      if (error) return error.message;
      return null;
    } catch (e: any) { return e.message || "添加失败"; }
  }, [items, table, key]);

  const remove = useCallback(async (id: string): Promise<string | null> => {
    if (DATA_MODE === "local") {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        lsSet(key, next);
        return next;
      });
      return null;
    }
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) return error.message;
      setItems((prev) => prev.filter((i) => i.id !== id));
      return null;
    } catch (e: any) { return e.message || "删除失败"; }
  }, [table, key]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<string | null> => {
    if (DATA_MODE === "local") {
      setItems((prev) => {
        const next = prev.map((i) => i.id === id ? { ...i, ...updates } : i);
        lsSet(key, next);
        return next;
      });
      return null;
    }
    try {
      const existing = items.find((i) => i.id === id);
      const merged = { ...existing, ...updates };
      const row = table === "products" ? toProductRow(merged) : toSnakeCase(merged);
      const { error } = await supabase.from(table).update(row).eq("id", id);
      if (error) return error.message;
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i));
      return null;
    } catch (e: any) { return e.message || "更新失败"; }
  }, [items, table]);

  return { items, loaded, saveAll, add, remove, update };
}

// ── Single hook (hero, craft pages) ──
export function useAdminSupabaseSingle<T extends Record<string, any>>(table: string, id: string | boolean, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const key = lsKeyFor(table);

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<T>(key);
      if (stored) setValue(stored);
      else lsSet(key, defaultValue);
      setLoaded(true);
      return;
    }
    if (typeof id === "boolean") {
      supabase.from(table).select("*").limit(1).maybeSingle().then(({ data, error }) => {
        if (!error && data) setValue(data as T);
        setLoaded(true);
      });
    } else {
      supabase.from(table).select("*").eq("page", id).maybeSingle().then(({ data, error }) => {
        if (!error && data) setValue(data as T);
        setLoaded(true);
      });
    }
  }, [table, id, key, defaultValue]);

  const save = useCallback(async (v: T): Promise<string | null> => {
    setValue(v);
    if (DATA_MODE === "local") {
      lsSet(key, v);
      return null;
    }
    try {
      const row = toSnakeCase(v);
      if (table === "homepage_hero") row.id = true;
      const { error } = await supabase.from(table).upsert(row);
      if (error) return error.message;
      return null;
    } catch (e: any) { return e.message || "发布失败"; }
  }, [table, key]);

  return { value, loaded, save };
}

// ── Sections hook (homepage_sections) ──
export function useAdminSections(table: string, defaults: any[]) {
  const [items, setItems] = useState<any[]>(defaults);
  const [loaded, setLoaded] = useState(false);
  const key = lsKeyFor(table);

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<any[]>(key);
      if (stored && stored.length > 0) setItems(stored);
      else lsSet(key, defaults);
      setLoaded(true);
      return;
    }
    supabase.from(table).select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (!error && data && data.length > 0) setItems(data);
      setLoaded(true);
    });
  }, [table, key, defaults]);

  const save = useCallback(async (newItems: any[]): Promise<{ error: string | null; count: number }> => {
    setItems(newItems);
    if (DATA_MODE === "local") {
      lsSet(key, newItems);
      return { error: null, count: newItems.length };
    }
    try {
      const { error: delErr } = await supabase.from(table).delete().not("id", "is", null);
      if (delErr) return { error: "删除旧数据失败: " + delErr.message, count: 0 };
      if (newItems.length > 0) {
        const rows = newItems.map((item: any, i: number) => ({
          title: item.title || "", description: item.description || "",
          image: item.image || "", link: item.link || "", sort_order: i,
        }));
        const { error: insErr } = await supabase.from(table).insert(rows);
        if (insErr) return { error: "写入失败: " + insErr.message, count: 0 };
      }
      const { data: verify } = await supabase.from(table).select("*");
      return { error: null, count: verify?.length || 0 };
    } catch (e: any) { return { error: e.message || "未知错误", count: 0 }; }
  }, [table, key]);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setItems((prev) => { const n = [...prev]; [n[index-1], n[index]] = [n[index], n[index-1]]; return n; });
  }, []);
  const moveDown = useCallback((index: number) => {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const n = [...prev]; [n[index], n[index+1]] = [n[index+1], n[index]]; return n;
    });
  }, []);
  const addSection = useCallback(() => {
    setItems((prev) => [...prev, { title: "", description: "", image: "", link: "", sort_order: prev.length }]);
  }, []);
  const removeSection = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const updateSection = useCallback((index: number, field: string, value: string) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  return { items, loaded, save, moveUp, moveDown, addSection, removeSection, updateSection };
}

// ── Contact hook ──
export function useAdminContact(defaultLinks: any[]) {
  const [links, setLinks] = useState<any[]>(defaultLinks);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (DATA_MODE === "local") {
      const stored = lsGet<any[]>(LS.contact);
      if (stored && stored.length > 0) setLinks(stored);
      else lsSet(LS.contact, defaultLinks);
      setLoaded(true);
      return;
    }
    supabase.from("contact_links").select("*").then(({ data, error }) => {
      if (!error && data && data.length > 0) setLinks(data);
      setLoaded(true);
    });
  }, [defaultLinks]);

  const save = useCallback(async (newLinks: any[]): Promise<string | null> => {
    setLinks(newLinks);
    if (DATA_MODE === "local") {
      lsSet(LS.contact, newLinks);
      return null;
    }
    try {
      await supabase.from("contact_links").delete().not("id", "is", null);
      if (newLinks.length > 0) {
        const { error } = await supabase.from("contact_links").insert(newLinks);
        if (error) return error.message;
      }
      return null;
    } catch (e: any) { return e.message || "保存失败"; }
  }, []);

  return { links, loaded, save };
}
