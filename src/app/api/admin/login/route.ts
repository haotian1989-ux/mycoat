import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "服务端未配置 ADMIN_PASSWORD" }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (password === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}
