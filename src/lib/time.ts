/**
 * ══════════════════════════════════════════
 *  MYCOAT Time Utility
 *  ────────────────────────
 *  原则：
 *  1. 所有时间存储使用 ISO 8601 UTC 字符串
 *  2. 所有显示根据用户本地时区转换
 *  3. 全球化客户群体，不做固定时区假设
 * ══════════════════════════════════════════
 */

/**
 * 获取当前 UTC ISO 时间戳，用于存储
 */
export function utcNow(): string {
  return new Date().toISOString();
}

/**
 * 将存储的 ISO 字符串转为用户本地可读时间
 */
export function formatLocal(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 相对时间描述（如 "3 天前"、"刚刚"）
 * 适合评论、动态等场景
 */
export function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  if (isNaN(then)) return isoString;

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

/**
 * 判断是否为有效 ISO 时间字符串
 */
export function isValidISO(str: string): boolean {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && str.includes("T");
}

/**
 * 规范化时间字符串——旧版纯日期转为 UTC ISO
 * "2024-12-15" → "2024-12-15T00:00:00.000Z"
 */
export function normalizeTime(str: string): string {
  if (!str) return utcNow();
  if (isValidISO(str)) return str;
  // 纯日期格式，补齐为 UTC 午夜
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str + "T00:00:00Z").toISOString();
  }
  // 无法识别，返回当前时间
  try {
    return new Date(str).toISOString();
  } catch {
    return utcNow();
  }
}
