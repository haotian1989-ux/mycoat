"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "mycoat_admin_session";
const PASSWORD_KEY = "mycoat_admin_password";
const DEFAULT_PASSWORD = "mycoat2026";
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

function loadPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  try {
    const stored = localStorage.getItem(PASSWORD_KEY);
    return stored || DEFAULT_PASSWORD;
  } catch { return DEFAULT_PASSWORD; }
}

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
  } catch { return false; }
}

function setAuthenticated() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState(DEFAULT_PASSWORD);

  useEffect(() => {
    setStoredPassword(loadPassword());
    setAuthed(isAuthenticated());
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === storedPassword) {
      setAuthenticated();
      setAuthed(true);
      setError("");
      setPassword("");
    } else {
      setError("密码错误");
      setPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
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
              disabled={!password}
              className="btn-primary w-full disabled:opacity-30"
            >
              登录
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
      {/* Logout bar */}
      <div className="bg-charcoal text-paper/30 flex items-center justify-between px-6 py-2">
        <span className="text-[10px] tracking-label uppercase">管理员</span>
        <div className="flex items-center gap-4">
          <PasswordChanger currentPassword={storedPassword} onChanged={(p) => setStoredPassword(p)} />
          <button onClick={handleLogout} className="text-[10px] tracking-label uppercase hover:text-paper transition-colors">
            退出登录
          </button>
        </div>
      </div>
      {children}
    </>
  );
}

function PasswordChanger({ currentPassword, onChanged }: { currentPassword: string; onChanged: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = () => {
    if (oldPw !== currentPassword) {
      setMsg("当前密码错误");
      return;
    }
    if (newPw.length < 6) {
      setMsg("新密码至少需要6位");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPw);
    onChanged(newPw);
    setMsg("密码已更新");
    setOpen(false);
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-[10px] tracking-label uppercase hover:text-paper transition-colors">
        修改密码
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-paper border border-line p-4 w-64 z-50 shadow-xl">
          <div className="space-y-3">
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="当前密码" className="w-full border border-line px-3 py-1.5 text-xs focus:outline-none focus:border-charcoal" />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密码（至少6位）" className="w-full border border-line px-3 py-1.5 text-xs focus:outline-none focus:border-charcoal" />
            {msg && <p className="text-[10px] text-gold">{msg}</p>}
            <div className="flex gap-2">
              <button onClick={handleChange} className="text-[10px] bg-charcoal text-paper px-3 py-1.5">保存</button>
              <button onClick={() => setOpen(false)} className="text-[10px] border border-line px-3 py-1.5">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
