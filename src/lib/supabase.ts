import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DATA_MODE } from "./config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return DATA_MODE === "supabase" && !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

function getClient(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

// 未配置 Supabase 时返回一个"哑客户端"：所有查询返回空结果，避免报错
const dummy = new Proxy({} as SupabaseClient, {
  get() {
    return () => Promise.resolve({ data: null, error: { message: "Supabase 未配置（本地模式）" } });
  },
});

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!isSupabaseConfigured()) return (dummy as any)[prop];
    return (getClient() as any)[prop];
  },
});
