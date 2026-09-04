"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { setAdminPassword, clearAdminPassword } from "@/lib/admin-api";

const SESSION_KEY = "mycoat_admin_session";
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const { timestamp } = JSON.parse(session);
    if (Date.now() - timestamp > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setAuthenticated() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "密码错误");
        setPassword("");
        return;
      }
      setAdminPassword(password);
      setAuthenticated();
      setAuthed(true);
      setPassword("");
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    clearAdminPassword();
    setAuthed(false);
  };

  if (loading) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock size={20} className="text-paper" />
            </div>
            <h1 className="font-serif text-xl mb-1">管理后台</h1>
            <p className="text-xs text-smoke">请输入密码</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                autoFocus
                className="w-full border border-line bg-transparent px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-charcoal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke/40 hover:text-smoke transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <button
              type="submit"
              disabled={!password || checking}
              className="btn-primary w-full disabled:opacity-30"
            >
              {checking ? "登录中..." : "登录"}
            </button>
          </form>

          <p className="text-[10px] text-smoke/30 text-center mt-8">
            MYCOAT 管理后台 · 安全入口
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-charcoal text-paper/30 flex items-center justify-between px-6 py-2">
        <span className="text-[10px] tracking-label uppercase">管理员</span>
        <button onClick={handleLogout} className="text-[10px] tracking-label uppercase hover:text-paper transition-colors">
          退出登录
        </button>
      </div>
      {children}
    </>
  );
}
