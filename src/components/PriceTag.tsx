"use client";

import { useEffect, useState } from "react";

// 圣诞折扣：2026-12-25 美东零点结束，届时恢复原价（现价 × 1.3）
const CHRISTMAS = new Date("2026-12-25T00:00:00-05:00").getTime();

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export default function PriceTag({ price, size = "card" }: { price: number; size?: "card" | "detail" }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const discounted = now < CHRISTMAS;
  const original = Math.round(price * 1.3);

  const diff = Math.max(0, CHRISTMAS - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  const countdown = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;

  if (size === "detail") {
    return (
      <div className="mb-6">
        <p className="text-xl font-light flex items-baseline gap-3">
          {discounted ? (
            <>
              <span className="text-smoke/50 line-through text-lg">${original.toLocaleString()}</span>
              <span className="text-charcoal">${price.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-charcoal">${original.toLocaleString()}</span>
          )}
        </p>
        {discounted && (
          <p className="mt-3 inline-flex items-center gap-2 bg-gold/10 border border-gold/40 text-gold px-3 py-1.5 text-xs tracking-wider">
            <span className="text-[10px] uppercase opacity-80">Christmas Sale ends in</span>
            <span className="font-semibold tabular-nums">{countdown}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-smoke tracking-wide flex items-baseline gap-2">
        {discounted ? (
          <>
            <span className="text-xs text-smoke/40 line-through">${original.toLocaleString()}</span>
            <span className="text-charcoal font-medium">
              <span className="text-[10px] text-muted mr-0.5">$</span>
              {price.toLocaleString()}
            </span>
          </>
        ) : (
          <span>${original.toLocaleString()}</span>
        )}
      </p>
      {discounted && (
        <p className="mt-1 text-[10px] tracking-wider text-gold tabular-nums">Ends {countdown}</p>
      )}
    </div>
  );
}
