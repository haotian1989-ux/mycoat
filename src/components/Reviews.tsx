"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { utcNow, relativeTime, formatLocal } from "@/lib/time";
import { DATA_MODE, LS, lsGet, lsSet } from "@/lib/config";

interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  content: string;
  date: string; // ISO 8601 UTC
}

async function saveReviewToSupabase(review: Review) {
  // 本地模式：不写云端
  if (DATA_MODE !== "supabase") return;
  await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": "mycoat2026" },
    body: JSON.stringify({
      table: "reviews",
      action: "add",
      data: {
        id: review.id,
        product_id: review.productId,
        author: review.author,
        rating: review.rating,
        title: "",
        content: review.content,
      },
    }),
  });
}

function loadAllReviews(): Review[] {
  return lsGet<Review[]>(LS.reviews) || [];
}

export default function Reviews({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    if (DATA_MODE === "local") {
      setReviews(loadAllReviews().filter((r) => r.productId === productId));
      setLoaded(true);
      return;
    }
    supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        setReviews(data.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          author: r.author || "",
          rating: r.rating,
          content: r.content || "",
          date: r.created_at || utcNow(),
        })));
      }
      setLoaded(true);
    });
  }, [productId]);

  const productReviews = reviews;
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
      : "0.0";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Review = {
      id: Date.now().toString(),
      productId,
      author: author.trim() || "Anonymous",
      rating,
      content: content.trim(),
      date: utcNow(),
    };
    const next = [newReview, ...productReviews];
    setReviews(next);
    if (DATA_MODE === "local") {
      const all = loadAllReviews();
      lsSet(LS.reviews, [newReview, ...all]);
    }
    setAuthor("");
    setContent("");
    setRating(5);
    setShowForm(false);
    await saveReviewToSupabase(newReview);
  };

  return (
    <section className="mt-20 pt-16 border-t border-line">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-serif text-xl md:text-2xl mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(Number(avgRating)) ? "fill-gold text-gold" : "text-border"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-smoke">
              {avgRating} · {productReviews.length} review
              {productReviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-outline">
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-ivory/30 p-8 mb-10 space-y-5">
          <h3 className="text-sm tracking-label uppercase text-smoke/60">
            Share Your Experience
          </h3>
          <div>
            <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                >
                  <Star
                    size={20}
                    className={
                      s <= (hoverStar || rating) ? "fill-gold text-gold" : "text-border"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-2">
              Your Name
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="How should we address you?"
              className="w-full border border-line bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-label uppercase text-smoke/50 block mb-2">
              Your Review
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder={`Tell us about your experience with ${productName}...`}
              className="w-full border border-line bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal resize-none"
            />
          </div>
          <button type="submit" className="btn-primary">
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-8">
        {productReviews.length === 0 && !showForm && (
          <p className="text-smoke text-sm">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
        {productReviews.map((r) => (
          <div
            key={r.id}
            className="pb-8 border-b border-line last:border-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s <= r.rating ? "fill-gold text-gold" : "text-border"}
                  />
                ))}
              </div>
              <span className="text-xs text-smoke/60" title={formatLocal(r.date)}>
                {relativeTime(r.date)}
              </span>
            </div>
            <p className="text-sm text-smoke leading-relaxed mb-2">{r.content}</p>
            <p className="text-xs text-smoke/50">— {r.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
