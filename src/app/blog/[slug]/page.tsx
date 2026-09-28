import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// 轻量正文渲染：支持 ## 标题、- / • 列表、**加粗**、空行分段；
// 对无标点结尾的短段落自动识别为小标题，保证可读性。
function looksLikeHeading(line: string): boolean {
  return line.length <= 90 && !/[.!?]$/.test(line) && !/,/.test(line);
}

function inline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, idx) => (idx % 2 === 1 ? <strong key={idx}>{p}</strong> : <span key={idx}>{p}</span>));
}

function renderBlocks(content: string) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let list: string[] = [];
  let key = 0;
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="my-4 space-y-2 pl-5">
          {list.map((item, i) => (
            <li key={i} className="list-disc text-sm md:text-[15px] leading-relaxed text-charcoal/90">
              {inline(item)}
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("### ")) { flushList(); blocks.push(<h3 key={key++} className="font-serif text-lg md:text-xl mt-8 mb-3">{inline(line.slice(4))}</h3>); }
    else if (line.startsWith("## ")) { flushList(); blocks.push(<h2 key={key++} className="font-serif text-xl md:text-2xl mt-10 mb-4">{inline(line.slice(3))}</h2>); }
    else if (line.startsWith("# ")) { flushList(); blocks.push(<h2 key={key++} className="font-serif text-xl md:text-2xl mt-10 mb-4">{inline(line.slice(2))}</h2>); }
    else if (/^[-•*]\s+/.test(line)) { list.push(line.replace(/^[-•*]\s+/, "")); }
    else {
      flushList();
      if (looksLikeHeading(line)) {
        blocks.push(<h2 key={key++} className="font-serif text-xl md:text-2xl mt-10 mb-4">{inline(line)}</h2>);
      } else {
        blocks.push(<p key={key++} className="mb-4 text-sm md:text-[15px] leading-[1.9] text-charcoal/90">{inline(line)}</p>);
      }
    }
  }
  flushList();
  return blocks;
}

async function getPost(slug: string): Promise<any | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.meta_description || post.excerpt || "",
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPost(slug);
  if (!post) notFound();

  const d = new Date(post.created_at || Date.now());
  const dateStr = isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="page-padding py-12 md:py-20">
      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] tracking-label uppercase text-smoke/50 mb-4">
            <Link href="/blog" className="hover:text-charcoal transition-colors">The Journal</Link>
            {dateStr ? <span> · {dateStr}</span> : null}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-6">{post.title}</h1>
        </header>
        <div>{renderBlocks(post.content || "")}</div>
        <footer className="mt-14 pt-8 border-t border-line">
          <Link href="/shop" className="btn-primary text-xs py-2.5 px-6">Shop the Collection</Link>
          <p className="text-[11px] text-smoke/50 mt-4">
            {SITE_NAME} — 90/10 European goose down, 700+ fill power, at an honest price.
          </p>
        </footer>
      </article>
    </div>
  );
}
