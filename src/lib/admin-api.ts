"use client";

// 后台写操作统一走服务端 /api/admin（服务端用 service role key + 密码校验）。
// 密码在登录成功后保存到 localStorage，供同会话内的后台请求附带。

const PASSWORD_KEY = "mycoat_admin_password";

export function setAdminPassword(pw: string) {
  try {
    localStorage.setItem(PASSWORD_KEY, pw);
  } catch {
    // ignore
  }
}

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(PASSWORD_KEY) || "";
  } catch {
    return "";
  }
}

export function clearAdminPassword() {
  try {
    localStorage.removeItem(PASSWORD_KEY);
  } catch {
    // ignore
  }
}

export async function adminFetch(
  table: string,
  action: string,
  data?: any,
  id?: string | number
): Promise<any> {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": getAdminPassword(),
    },
    body: JSON.stringify({ table, action, data, id }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "后台请求失败");
  }
  return json;
}
