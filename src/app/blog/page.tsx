import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Journal | ${SITE_NAME}`,
  description:
    "Guides and insight on premium down jackets — fill power, goose down, weatherproof shells and how to buy luxury warmth at an honest price.",
};

export default async function BlogPage() {
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, meta_description, excerpt, content, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const posts = data || [];

  const excerptOf = (p: any): string => {
    if (p.excerpt?.trim()) return p.excerpt.trim();
    const text = (p.content || "").replace(/\*\*/g, "").replace(/^[-•*]\s+/gm, "").replace(/\s+/g, " ").trim();
    return text.length > 160 ? text.slice(0, 157) + "…" : text;
  };

  const dateOf = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="page-padding py-12 md:py-20 max-w-3xl">
      <header className="mb-12">
        <p className="text-[10px] tracking-label uppercase text-smoke/50 mb-3">The Journal</p>
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Guides &amp; Stories</h1>
        <p className="text-sm text-smoke max-w-lg leading-relaxed">
          What actually keeps you warm, what the spec sheets mean, and how to spot premium winter
          outerwear without the luxury markup.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-smoke/40 py-16 text-center border border-dashed border-line">
          New stories coming soon.
        </p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="block group border border-line/50 hover:border-line transition-colors p-6 md:p-8">
              <p className="text-[10px] tracking-label uppercase text-smoke/40 mb-3">{dateOf(p.created_at)}</p>
              <h2 className="font-serif text-xl md:text-2xl group-hover:underline underline-offset-4 mb-2">{p.title}</h2>
              <p className="text-sm text-smoke leading-relaxed">{excerptOf(p)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
