import { createClient } from "@supabase/supabase-js";
import { DATA_MODE } from "./config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function getServiceSupabase() {
  // 本地模式下不创建客户端（页面会 fallback 到本地种子数据）
  if (DATA_MODE !== "supabase" || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return createClient("https://placeholder.supabase.co", "placeholder");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
