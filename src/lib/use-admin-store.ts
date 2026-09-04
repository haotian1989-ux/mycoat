"use client";

import { useState, useEffect, useCallback } from "react";

export function useAdminStore<T>(key: string, defaults: T[]) {
  const [items, setItems] = useState<T[]>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {}
    setItems(defaults);
    localStorage.setItem(key, JSON.stringify(defaults));
    setLoaded(true);

    const onStorage = () => {
      try {
        const r = localStorage.getItem(key);
        if (r) { const p = JSON.parse(r); if (Array.isArray(p) && p.length > 0) setItems(p); }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, defaults]);

  const save = useCallback((newItems: T[]) => {
    setItems(newItems);
    localStorage.setItem(key, JSON.stringify(newItems));
    window.dispatchEvent(new Event("storage"));
  }, [key]);

  const add = useCallback((item: T) => save([...items, item]), [items, save]);
  const remove = useCallback((id: string) => save(items.filter((i: any) => i.id !== id)), [items, save]);
  const update = useCallback((id: string, updates: Partial<T>) => save(items.map((i: any) => i.id === id ? { ...i, ...updates } : i)), [items, save]);

  return { items, loaded, save, add, remove, update };
}

/* ── Simple key-value store for homepage hero ── */
export function useSiteConfig(key: string, defaultValue: any) {
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { setValue(JSON.parse(raw)); setLoaded(true); return; }
    } catch {}
    setValue(defaultValue);
    localStorage.setItem(key, JSON.stringify(defaultValue));
    setLoaded(true);
  }, [key, defaultValue]);

  const save = useCallback((v: any) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
    window.dispatchEvent(new Event("storage"));
  }, [key]);

  return { value, loaded, save };
}
