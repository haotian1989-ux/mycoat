import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DATA_MODE } from "./config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isCloudConfigured(): boolean {
  return DATA_MODE === "supabase" && !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

// 服务端公开读取（anon key，受 RLS 约束）
export function getServerSupabase(): SupabaseClient {
  if (!isCloudConfigured()) {
    return createClient("https://placeholder.supabase.co", "placeholder");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 后台写操作（service role key，绕过 RLS；仅限服务端 /api/admin 使用）
export function getAdminSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 未配置，后台写操作不可用");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
