"use client";

// 全站折扣价：始终显示"原价（删除线） + 现价"，原价 = 现价 × 1.3
export default function PriceTag({ price, size = "card" }: { price: number; size?: "card" | "detail" }) {
  const original = Math.round(price * 1.3);

  if (size === "detail") {
    return (
      <p className="text-xl font-light flex items-baseline gap-3 mb-6">
        <span className="text-smoke/50 line-through text-lg">${original.toLocaleString()}</span>
        <span className="text-charcoal">${price.toLocaleString()}</span>
      </p>
    );
  }

  return (
    <p className="text-sm text-smoke tracking-wide flex items-baseline gap-2">
      <span className="text-xs text-smoke/40 line-through">${original.toLocaleString()}</span>
      <span className="text-charcoal font-medium">
        <span className="text-[10px] text-muted mr-0.5">$</span>
        {price.toLocaleString()}
      </span>
    </p>
  );
}
