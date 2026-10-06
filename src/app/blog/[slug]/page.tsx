import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// 轻量正文渲染：支持 ## 标题、- / • 列表、**加粗**、[关键词](链接)、空行分段；
// 对无标点结尾的短段落自动识别为小标题，保证可读性。
function looksLikeHeading(line: string): boolean {
  return line.length <= 90 && !/[.!?]$/.test(line) && !/,/.test(line);
}

function inlineText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, idx) => (idx % 2 === 1 ? <strong key={idx}>{p}</strong> : <span key={idx}>{p}</span>));
}

// 支持 [锚文本](链接) 行内链接；站内链接不加 target，外链新窗口打开。
function inline(text: string) {
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return linkParts.map((p, i) => {
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const external = /^https?:\/\//.test(m[2]);
      return (
        <a
          key={i}
          href={m[2]}
          className="text-charcoal underline underline-offset-2 decoration-gold/60 hover:text-gold transition-colors"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {inlineText(m[1])}
        </a>
      );
    }
    return inlineText(p);
  });
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

  // GEO 结构化数据：BlogPosting JSON-LD，帮 AI 搜索引擎定位文章实体
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.meta_description || post.excerpt || "",
    datePublished: post.created_at ? new Date(post.created_at).toISOString().split("T")[0] : undefined,
    dateModified: post.updated_at ? new Date(post.updated_at).toISOString().split("T")[0] : undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
  };

  return (
    <div className="page-padding py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] tracking-label uppercase text-smoke/50 mb-4">
            <Link href="/blog" className="hover:text-charcoal transition-colors">The Journal</Link>
            {dateStr ? <span> · {dateStr}</span> : null}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-6">{post.title}</h1>
          {post.cover_image ? (
            <div className="mb-8 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          ) : null}
        </header>
        <div>{renderBlocks(post.content || "")}</div>
        <footer className="mt-14 pt-8 border-t border-line">
          <Link href="/shop" className="btn-primary text-xs py-2.5 px-6">Explore MYCOAT 90/10 Goose Down Jackets</Link>
          <p className="text-[11px] text-smoke/50 mt-4">
            {SITE_NAME} — 90/10 European goose down, 700+ fill power, at an honest price.
          </p>
        </footer>
      </article>
    </div>
  );
}
