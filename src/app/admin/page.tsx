"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Layout, ShoppingBag, MessageCircle, Wallet, BookOpen, Inbox, ArrowUp, ArrowDown, Tags } from "lucide-react";
import { useAdminSupabaseList, useAdminSupabaseSingle, useAdminSections, useAdminContact } from "@/lib/use-supabase-data";
import { adminFetch } from "@/lib/admin-api";
import { Product, ProductSubcategory, ProductCategory, PaymentConfig } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";
import VideoUploader from "@/components/VideoUploader";
import { products as defaultProducts, defaultSubcategories as seedSubs } from "@/lib/data";
import AdminGate from "@/components/AdminGate";
import { DATA_MODE, LS, lsGet, lsSet } from "@/lib/config";

type AdminTab = "products" | "categories" | "homepage" | "contact" | "payment" | "about" | "orders";

const tabs: { key: AdminTab; label: string; icon: any }[] = [
  { key: "products", label: "产品管理", icon: ShoppingBag },
  { key: "categories", label: "分类管理", icon: Tags },
  { key: "homepage", label: "首页编辑", icon: Layout },
  { key: "contact", label: "联系方式", icon: MessageCircle },
  { key: "payment", label: "支付设置", icon: Wallet },
  { key: "about", label: "关于我们", icon: BookOpen },
  { key: "orders", label: "客户订单", icon: Inbox },
];

function AdminContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  return (
    <div className="min-h-screen bg-ivory/20">
      <div className="page-padding py-10 md:py-14">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-smoke hover:text-charcoal transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-serif text-2xl">管理后台</h1>
              <p className="text-xs text-smoke mt-0.5">管理您的羽绒服店铺</p>
            </div>
          </div>
          <Link href="/" className="btn-outline text-xs">查看网站</Link>
        </div>
        <div className="flex gap-1 mb-8 border-b border-line overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-xs tracking-label uppercase transition-colors whitespace-nowrap ${
                  activeTab === t.key ? "text-charcoal border-b-2 border-charcoal -mb-[1px]" : "text-smoke/40 hover:text-smoke"
                }`}>
                <Icon size={13} strokeWidth={1.5} />{t.label}
              </button>
            );
          })}
        </div>
        {activeTab === "products" && <ProductManager />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "homepage" && <HomepageEditor />}
        {activeTab === "contact" && <ContactEditor />}
        {activeTab === "payment" && <PaymentEditor />}
        {activeTab === "about" && <AboutEditor />}
        {activeTab === "orders" && <OrdersManager />}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return <AdminGate><AdminContent /></AdminGate>;
}

const CATEGORY_LABELS: Record<string, string> = { men: "男装", women: "女装" };
const CATEGORY_ORDER: ProductCategory[] = ["men", "women"];
const defaultSubcategories: ProductSubcategory[] = seedSubs as unknown as ProductSubcategory[];

// ── Product Manager ──
function ProductManager() {
  const products = useAdminSupabaseList<Product>("products", defaultProducts);
  const subcats = useAdminSupabaseList<ProductSubcategory>("product_subcategories", defaultSubcategories);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyProduct: Product = {
    id: `prod-${Date.now()}`, name: "", slug: "", category: "men", subcategory: "", price: 0,
    description: "", details: [], materials: "", dimensions: "",
    colors: [], sizes: ["S", "M", "L", "XL"], images: [], inStock: true, featured: false, newArrival: false,
  };

  if (!products.loaded) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const subName = (id?: string) => (id ? subcats.items.find((s) => s.id === id)?.name || id : "");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-xs text-smoke">{products.items.length} 件产品{DATA_MODE === "local" ? " · 本地模式（浏览器存储）" : " · 云端同步"}</p>
        <button onClick={() => { setAdding(true); setEditing(emptyProduct); }}
          className="btn-primary text-[10px] gap-1 py-2 px-4"><Plus size={12} /> 添加产品</button>
      </div>
      {(editing || adding) && (
        <ProductEditor product={editing!} subcategories={subcats.items} onSave={async (p) => {
            if (!p.name.trim()) { alert("请输入产品名称"); return; }
            if (!p.slug.trim()) { alert("Slug 不能为空"); return; }
            if (products.items.some((x) => x.slug === p.slug && x.id !== p.id)) { alert("该 Slug 已存在，请修改后再保存"); return; }
            if (adding) { const err = await products.add(p); if (err) { alert("添加失败: " + err); return; } setAdding(false); }
            else { const err = await products.update(p.id, p); if (err) { alert("更新失败: " + err); return; } setEditing(null); }
          }} onCancel={() => { setEditing(null); setAdding(false); }} />
      )}
      <div className="space-y-1">
        {products.items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 border border-line/50 hover:border-line transition-colors">
            <div className="w-14 h-16 bg-ivory/50 flex-shrink-0 overflow-hidden">
              {p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{p.name || "未命名"}</p>
                <span className="text-[10px] text-smoke/40">{CATEGORY_LABELS[p.category] || p.category}{p.subcategory ? ` · ${subName(p.subcategory)}` : ""}</span>
                {p.featured && <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5">精选</span>}
                {p.newArrival && <span className="text-[9px] bg-charcoal text-paper px-1.5 py-0.5">新品</span>}
              </div>
              <p className="text-xs text-smoke">${p.price.toLocaleString()}{!p.inStock ? " · 已售罄" : ""}</p>
            </div>
            <button onClick={() => setEditing({ ...p })} className="p-1.5 text-smoke/30 hover:text-charcoal"><Edit3 size={14} /></button>
            <button onClick={async () => { const err = await products.remove(p.id); if (err) alert("删除失败: " + err); }} className="p-1.5 text-smoke/30 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function toSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-+/g, '-');
  return base || `product-${Date.now().toString(36)}`;
}

function ProductEditor({ product, subcategories, onSave, onCancel }: { product: Product; subcategories: ProductSubcategory[]; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Product>({ ...product });
  const slugManualRef = useRef(false);
  const upd = (k: keyof Product, v: any) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-start justify-center pt-20 overflow-y-auto">
      <div className="bg-paper p-8 w-full max-w-2xl mx-4 shadow-2xl mb-20">
        <h2 className="font-serif text-xl mb-6">{product.id.startsWith("prod-") ? "新建产品" : "编辑产品"}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">名称</label><input value={form.name} onChange={(e) => { upd("name", e.target.value); if (!slugManualRef.current) upd("slug", toSlug(e.target.value)); }} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">Slug <span className="text-smoke/30 font-normal lowercase">（自动生成）</span></label><input value={form.slug} onChange={(e) => { upd("slug", e.target.value); slugManualRef.current = true; }} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">分类</label><select value={form.category} onChange={(e) => { upd("category", e.target.value); upd("subcategory", ""); }} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-paper"><option value="men">男装</option><option value="women">女装</option></select></div>
          <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">子分类</label><select value={form.subcategory || ""} onChange={(e) => upd("subcategory", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-paper"><option value="">无子分类</option>{subcategories.filter((s) => s.category === form.category).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}</select></div>
          <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">价格 ($)</label><input type="number" value={form.price} onChange={(e) => upd("price", Number(e.target.value))} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div className="col-span-2 flex items-center gap-4"><label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.featured} onChange={(e) => upd("featured", e.target.checked)} className="accent-charcoal" /> 精选</label><label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.newArrival} onChange={(e) => upd("newArrival", e.target.checked)} className="accent-charcoal" /> 新品</label><label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.inStock} onChange={(e) => upd("inStock", e.target.checked)} className="accent-charcoal" /> 有库存</label></div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">描述</label><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={3} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" /></div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">材质</label><input value={form.materials} onChange={(e) => upd("materials", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">版型/尺寸说明</label><input value={form.dimensions} onChange={(e) => upd("dimensions", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">颜色（逗号分隔）</label><input value={form.colors.join(", ")} onChange={(e) => upd("colors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">尺码（逗号分隔）</label><input value={form.sizes.join(", ")} onChange={(e) => upd("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="S, M, L, XL, XXL" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-2">产品图片（第一张为主图）</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {form.images.map((img, i) => (
                <ImageUploader
                  key={i}
                  value={img}
                  onChange={(url) => { const imgs = [...form.images]; imgs[i] = url; upd("images", imgs); }}
                />
              ))}
              <button onClick={() => upd("images", [...form.images, ""])} className="w-20 h-20 border-2 border-dashed border-line/50 flex items-center justify-center text-smoke/30 hover:text-smoke hover:border-line transition-colors"><Plus size={18} /></button>
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-2">产品视频（可选，竖版 9:16 效果最佳）</label>
            <VideoUploader
              value={form.video || ""}
              onChange={(url) => upd("video", url)}
            />
          </div>
          <div className="col-span-2"><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">细节（每行一个）</label><textarea value={form.details.join("\n")} onChange={(e) => upd("details", e.target.value.split("\n").filter(Boolean))} rows={4} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" /></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onSave(form)} className="btn-primary text-xs py-2 px-6"><Save size={14} className="mr-1" /> 发布</button>
          <button onClick={onCancel} className="btn-outline text-xs py-2 px-6"><X size={14} className="mr-1" /> 取消</button>
        </div>
      </div>
    </div>
  );
}

// ── Category Manager ──
function CategoryManager() {
  const subcats = useAdminSupabaseList<ProductSubcategory>("product_subcategories", defaultSubcategories);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ProductCategory>("men");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!subcats.loaded) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const sorted = [...subcats.items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const groupOf = (cat: ProductCategory) => sorted.filter((s) => s.category === cat);

  const add = async () => {
    const name = newName.trim();
    if (!name) { alert("请输入子分类名称"); return; }
    const id = `${newCategory}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/-+/g, "-")}`;
    if (!id || id === `${newCategory}_`) { alert("子分类名称需包含字母或数字"); return; }
    if (subcats.items.some((s) => s.id === id)) { alert("该子分类已存在"); return; }
    setBusy(true);
    const group = groupOf(newCategory);
    const nextSort = group.length ? Math.max(...group.map((s) => s.sortOrder ?? 0)) + 1 : 0;
    const err = await subcats.add({ id, name, category: newCategory, sortOrder: nextSort });
    setBusy(false);
    if (err) { alert("添加失败: " + err); return; }
    setNewName("");
  };

  const rename = async (id: string) => {
    const name = editName.trim();
    if (!name) { alert("名称不能为空"); return; }
    const err = await subcats.update(id, { name });
    if (err) { alert("重命名失败: " + err); return; }
    setEditingId(null);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`确定删除子分类「${name}」吗？`)) return;
    const err = await subcats.remove(id);
    if (err) alert("删除失败: " + err);
  };

  const move = async (cat: ProductCategory, id: string, dir: -1 | 1) => {
    const group = groupOf(cat);
    const idx = group.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= group.length) return;
    const nextGroup = [...group];
    [nextGroup[idx], nextGroup[target]] = [nextGroup[target], nextGroup[idx]];
    const rebuilt = [
      ...sorted.filter((s) => s.category !== cat),
      ...nextGroup.map((s, i) => ({ ...s, sortOrder: i })),
    ];
    const err = await subcats.saveAll(rebuilt);
    if (err) alert("排序失败: " + err);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-lg">分类管理</h2>
          <p className="text-xs text-smoke/60">子分类挂在男装/女装两大主分类下，用于前台更细粒度的浏览筛选</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-8 p-4 border border-line/50">
        <div>
          <label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">主分类</label>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ProductCategory)} className="border border-line px-3 py-2 text-sm bg-paper focus:outline-none focus:border-charcoal">
            {CATEGORY_ORDER.map((c) => (<option key={c} value={c}>{CATEGORY_LABELS[c]}</option>))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">子分类名称</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="例如 Short Down" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
        </div>
        <button onClick={add} disabled={busy} className="btn-primary text-[10px] gap-1 py-2 px-4"><Plus size={12} /> 添加</button>
      </div>

      <div className="space-y-6">
        {CATEGORY_ORDER.map((cat) => {
          const group = groupOf(cat);
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-serif text-base">{CATEGORY_LABELS[cat]}</h3>
                <span className="text-[10px] text-smoke/40 uppercase">{cat}</span>
                <span className="text-[10px] text-smoke/40">{group.length} 个子分类</span>
              </div>
              {group.length === 0 ? (
                <p className="text-xs text-smoke/40 py-4 text-center border border-dashed border-line">该主分类下暂无子分类</p>
              ) : (
                <div className="space-y-1">
                  {group.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 p-3 border border-line/50 hover:border-line transition-colors">
                      <span className="text-[10px] text-smoke/40 w-6 text-right">{i + 1}</span>
                      {editingId === s.id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") rename(s.id); }} className="flex-1 border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-charcoal" autoFocus />
                      ) : (
                        <span className="flex-1 text-sm">{s.name}</span>
                      )}
                      <button onClick={() => move(cat, s.id, -1)} disabled={i === 0} className="p-1.5 text-smoke/30 hover:text-charcoal disabled:opacity-20" title="上移"><ArrowUp size={14} /></button>
                      <button onClick={() => move(cat, s.id, 1)} disabled={i === group.length - 1} className="p-1.5 text-smoke/30 hover:text-charcoal disabled:opacity-20" title="下移"><ArrowDown size={14} /></button>
                      {editingId === s.id ? (
                        <>
                          <button onClick={() => rename(s.id)} className="text-[10px] py-1.5 px-3 btn-primary">保存</button>
                          <button onClick={() => setEditingId(null)} className="text-[10px] py-1.5 px-3 btn-outline">取消</button>
                        </>
                      ) : (
                        <button onClick={() => { setEditingId(s.id); setEditName(s.name); }} className="p-1.5 text-smoke/30 hover:text-charcoal" title="重命名"><Edit3 size={14} /></button>
                      )}
                      <button onClick={() => remove(s.id, s.name)} className="p-1.5 text-smoke/30 hover:text-red-500" title="删除"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Homepage Editor ──
const HERO_DEFAULTS = {
  image: "",
  tagline: "Maison · Est. 2026",
  headline: "Warmth,\nRefined.",
  subtext: "Premium down jackets filled with 90/10 European goose down. Water-repellent shells, honest prices from $149.",
  primaryBtnLabel: "Explore Collection",
  secondaryBtnLabel: "Our Craft",
  promiseTitle: "The MYCOAT Promise",
  promise1Title: "90/10 Goose Down",
  promise1Text: "European grey goose down with 700+ fill power — the same specification used by luxury alpine houses, at an honest price.",
  promise2Title: "Weatherproof Shells",
  promise2Text: "Every jacket uses a water-repellent, windproof shell with YKK hardware. Built for real winters, not just looks.",
  promise3Title: "Free Shipping & Returns",
  promise3Text: "Free worldwide shipping on orders over $200, with 30-day hassle-free returns.",
};

const SECTION_DEFAULTS = [
  { title: "Men", description: "Short, long and packable down for men", image: "/products/mens-black-puffer.jpg", link: "/shop?category=men", sort_order: 0 },
  { title: "Women", description: "Puffers and parkas for women", image: "/products/womens-camel-parka.jpg", link: "/shop?category=women", sort_order: 1 },
  { title: "The Craft", description: "90/10 goose down, water-repellent shells", image: "/products/mens-navy-long.jpg", link: "/craft", sort_order: 2 },
];

function HomepageEditor() {
  const hero = useAdminSupabaseSingle("homepage_hero", true, HERO_DEFAULTS);
  const sections = useAdminSections("homepage_sections", SECTION_DEFAULTS);
  const { moveUp, moveDown, addSection, removeSection, updateSection } = sections;
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hero.loaded && hero.value) {
      const row: any = hero.value;
      const vv: any = {
        image: row.image ?? HERO_DEFAULTS.image,
        tagline: row.tagline ?? HERO_DEFAULTS.tagline,
        headline: row.headline ?? HERO_DEFAULTS.headline,
        subtext: row.subtext ?? HERO_DEFAULTS.subtext,
        primaryBtnLabel: row.primary_btn_label ?? row.primaryBtnLabel ?? HERO_DEFAULTS.primaryBtnLabel,
        secondaryBtnLabel: row.secondary_btn_label ?? row.secondaryBtnLabel ?? HERO_DEFAULTS.secondaryBtnLabel,
        promiseTitle: row.promise_title ?? row.promiseTitle ?? HERO_DEFAULTS.promiseTitle,
        promise1Title: row.promise_1_title ?? row.promise1Title ?? HERO_DEFAULTS.promise1Title,
        promise1Text: row.promise_1_text ?? row.promise1Text ?? HERO_DEFAULTS.promise1Text,
        promise2Title: row.promise_2_title ?? row.promise2Title ?? HERO_DEFAULTS.promise2Title,
        promise2Text: row.promise_2_text ?? row.promise2Text ?? HERO_DEFAULTS.promise2Text,
        promise3Title: row.promise_3_title ?? row.promise3Title ?? HERO_DEFAULTS.promise3Title,
        promise3Text: row.promise_3_text ?? row.promise3Text ?? HERO_DEFAULTS.promise3Text,
      };
      setForm((prev: any) => prev || vv);
    }
  }, [hero.loaded, hero.value]);

  if (!hero.loaded || !sections.loaded || !form) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const upd = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  const saveAll = async () => {
    setSaving(true);
    const heroErr = await hero.save(form);
    if (heroErr) { setMsg("主图发布失败: " + heroErr); setSaving(false); return; }
    const secResult = await sections.save(sections.items);
    if (secResult.error) { setMsg("区块发布失败: " + secResult.error); setSaving(false); return; }
    setMsg("已发布！(" + secResult.count + " 个区块)");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-lg mb-1">主图区域</h2>
      <p className="text-xs text-smoke/60 mb-6">首页主横幅</p>
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">背景图片</label>
          <ImageUploader value={form.image || ""} onChange={(url) => upd("image", url)} compress={false} />
          {form.image && (
            <div className="mt-2 aspect-[21/9] overflow-hidden bg-ivory/50">
              <img src={form.image} alt="预览" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">标语</label><input value={form.tagline || ""} onChange={(e) => upd("tagline", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">标题</label><textarea value={form.headline || ""} onChange={(e) => upd("headline", e.target.value)} rows={2} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none font-serif text-lg" /></div>
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">副标题</label><textarea value={form.subtext || ""} onChange={(e) => upd("subtext", e.target.value)} rows={3} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">主按钮</label><input value={form.primaryBtnLabel || ""} onChange={(e) => upd("primaryBtnLabel", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div><div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">副按钮</label><input value={form.secondaryBtnLabel || ""} onChange={(e) => upd("secondaryBtnLabel", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div></div>
      </div>

      <h2 className="font-serif text-lg mb-1 mt-10">品牌承诺区块</h2>
      <p className="text-xs text-smoke/60 mb-4">首页「The MYCOAT Promise」三个承诺的内容</p>
      <div className="space-y-4 mb-6">
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">区块标题</label><input value={form.promiseTitle || ""} onChange={(e) => upd("promiseTitle", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" /></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="border border-line/50 p-4 space-y-2">
            <span className="text-[10px] text-smoke/40">承诺 #{n}</span>
            <input value={form["promise" + n + "Title"] || ""} onChange={(e) => upd("promise" + n + "Title", e.target.value)} placeholder="标题" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
            <textarea value={form["promise" + n + "Text"] || ""} onChange={(e) => upd("promise" + n + "Text", e.target.value)} rows={3} placeholder="内容" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" />
          </div>
        ))}
      </div>

      <div className="border-t border-line pt-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-serif text-lg">Our Collections 区块</h2>
            <p className="text-xs text-smoke/60">首页「Our Collections」栏目的内容。上下箭头调整顺序</p>
          </div>
          <button onClick={addSection} className="btn-outline text-[10px] gap-1 py-1.5 px-3"><Plus size={12} /> 添加区块</button>
        </div>
        {sections.items.length === 0 ? (
          <p className="text-xs text-smoke/40 py-6 text-center border border-dashed border-line">暂无区块，点击「添加区块」创建新的 Collection 卡片</p>
        ) : (
          <div className="space-y-3">
            {sections.items.map((sec: any, i: number) => (
              <div key={i} className="p-4 border border-line/50 space-y-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-smoke/40 w-6">#{i + 1}</span>
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-smoke/30 hover:text-charcoal disabled:opacity-20" title="上移"><ArrowUp size={14} /></button>
                  <button onClick={() => moveDown(i)} disabled={i === sections.items.length - 1} className="p-1 text-smoke/30 hover:text-charcoal disabled:opacity-20" title="下移"><ArrowDown size={14} /></button>
                  <div className="flex-1" />
                  <button onClick={() => removeSection(i)} className="p-1 text-smoke/30 hover:text-red-500" title="删除"><Trash2 size={14} /></button>
                </div>
                <div><label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">标题</label><input value={sec.title || ""} onChange={(e) => updateSection(i, "title", e.target.value)} className="w-full border border-line px-3 py-1.5 text-xs focus:outline-none focus:border-charcoal" /></div>
                <div><label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">描述</label><textarea value={sec.description || ""} onChange={(e) => updateSection(i, "description", e.target.value)} rows={2} className="w-full border border-line px-3 py-1.5 text-xs focus:outline-none focus:border-charcoal resize-none" /></div>
                <div className="space-y-2">
                  <div><label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">图片</label><ImageUploader value={sec.image || ""} onChange={(url) => updateSection(i, "image", url)} /></div>
                  <div><label className="text-[9px] tracking-label uppercase text-smoke/40 block mb-0.5">链接</label><input value={sec.link || ""} onChange={(e) => updateSection(i, "link", e.target.value)} placeholder="/shop?category=men" className="w-full border border-line px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-charcoal" /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={saveAll} disabled={saving} className={`btn-primary mt-6 ${msg ? (msg.includes("失败") ? "bg-red-800 border-0" : "bg-green-800 border-0") : ""}`}>{saving ? "发布中..." : (msg || "发布首页")}</button>
    </div>
  );
}

// ── Contact Editor ──
function ContactEditor() {
  const contacts = useAdminContact([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contacts.loaded) {
      setWhatsapp(contacts.links.find((l: any) => l.type === "whatsapp")?.url || "");
      setTelegram(contacts.links.find((l: any) => l.type === "telegram")?.url || "");
    }
  }, [contacts.loaded, contacts.links]);

  const save = async () => {
    setSaved(false);
    const links: any[] = [];
    if (whatsapp.trim()) links.push({ type: "whatsapp", label: "WhatsApp", url: whatsapp.trim() });
    if (telegram.trim()) links.push({ type: "telegram", label: "Telegram", url: telegram.trim() });
    const err = await contacts.save(links);
    if (err) { alert("发布失败: " + err); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!contacts.loaded) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;
  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-lg mb-1">联系链接</h2><p className="text-xs text-smoke/60 mb-6">悬浮客服按钮链接</p>
      {error && <p className="text-xs text-red-500 mb-4 bg-red-50 p-3">{error}</p>}
      <div className="space-y-4 mb-6">
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">WhatsApp 链接</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://wa.me/1234567890" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs" /></div>
        <div><label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">Telegram 链接</label><input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/yourusername" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs" /></div>
      </div>
      <button onClick={save} className={`btn-primary ${saved ? "bg-green-800 border-0" : ""}`}>{saved ? "✓ 已发布" : "发布链接"}</button>
    </div>
  );
}

// ── Payment Editor（PayPal + USDT）──
const PAYMENT_DEFAULTS: PaymentConfig = {
  paypalUsername: "",
  paypalEmail: "",
  usdtAddress: "",
  usdtNetwork: "TRC-20 (Tron Network)",
};

function PaymentEditor() {
  const payment = useAdminSupabaseSingle("payment_settings", true, PAYMENT_DEFAULTS);
  const [form, setForm] = useState<PaymentConfig>(PAYMENT_DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (payment.loaded && payment.value) {
      const row: any = payment.value;
      setForm({
        paypalUsername: row.paypal_username ?? row.paypalUsername ?? PAYMENT_DEFAULTS.paypalUsername,
        paypalEmail: row.paypal_email ?? row.paypalEmail ?? PAYMENT_DEFAULTS.paypalEmail,
        usdtAddress: row.usdt_address ?? row.usdtAddress ?? PAYMENT_DEFAULTS.usdtAddress,
        usdtNetwork: row.usdt_network ?? row.usdtNetwork ?? PAYMENT_DEFAULTS.usdtNetwork,
      });
    }
  }, [payment.loaded, payment.value]);

  if (!payment.loaded) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const upd = (key: keyof PaymentConfig, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    setError("");
    const err = await payment.save(form);
    setSaving(false);
    if (err) { setError(err); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-lg mb-1">支付设置</h2>
      <p className="text-xs text-smoke/60 mb-6">结算页 PayPal + USDT 双通道的收款信息（保存后立即生效）</p>
      <div className="space-y-5 mb-6">
        <div className="border border-line/50 p-5">
          <h3 className="text-xs tracking-label uppercase text-smoke mb-4">PayPal</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">paypal.me 用户名</label>
              <input value={form.paypalUsername} onChange={(e) => upd("paypalUsername", e.target.value)} placeholder="yourname（https://paypal.me/yourname）" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs" />
            </div>
            <div>
              <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">收款邮箱（展示用）</label>
              <input value={form.paypalEmail} onChange={(e) => upd("paypalEmail", e.target.value)} placeholder="you@example.com" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
            </div>
          </div>
        </div>
        <div className="border border-line/50 p-5">
          <h3 className="text-xs tracking-label uppercase text-smoke mb-4">USDT 加密货币</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">USDT 收款地址（TRC-20）</label>
              <textarea value={form.usdtAddress} onChange={(e) => upd("usdtAddress", e.target.value)} rows={3} placeholder="T开头的TRC-20地址" className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs resize-none" />
            </div>
            <div>
              <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">网络说明</label>
              <input value={form.usdtNetwork} onChange={(e) => upd("usdtNetwork", e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
            </div>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 bg-red-50 p-3 mb-4">{error}</p>}
      <button onClick={save} disabled={saving} className={`btn-primary ${saved ? "bg-green-800 border-0" : ""}`}>{saving ? "保存中..." : saved ? "✓ 已保存" : "保存支付设置"}</button>
    </div>
  );
}

// ── About (Our Story) Editor ──
const ABOUT_DEFAULTS: Record<string, string> = {
  heroImage: "/products/womens-camel-parka.jpg",
  heroTagline: "Since 2026",
  heroTitle: "Our Story",
  section1Label: "Philosophy",
  section1Heading: "Luxury warmth.\nHonest price.",
  section1Text: "At MYCOAT, we believe winter outerwear should be judged by one thing: how well it keeps you warm. We use the same 90/10 European goose down, water-repellent shells and YKK hardware found on jackets three times the price — and skip everything that doesn't keep you warm.",
  section1Image: "/products/mens-black-puffer.jpg",
  section2Label: "Materials",
  section2Heading: "Specs first, always.",
  section2Text: "700+ fill power down. DWR-coated nylon. Reinforced quilting. Every specification is published on every product page — because when the materials are right, we don't need to hide anything.",
  section2Image: "/products/womens-silver-matte.jpg",
  ctaText: "Shop the Collection",
  ctaLink: "/shop",
};

function AboutEditor() {
  const about = useAdminSupabaseSingle("about_page", true, ABOUT_DEFAULTS);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (about.loaded && about.value) {
      const row: any = about.value;
      const v: any = {
        heroImage: row.hero_image ?? row.heroImage ?? ABOUT_DEFAULTS.heroImage,
        heroTagline: row.hero_tagline ?? row.heroTagline ?? ABOUT_DEFAULTS.heroTagline,
        heroTitle: row.hero_title ?? row.heroTitle ?? ABOUT_DEFAULTS.heroTitle,
        section1Label: row.section1_label ?? row.section1Label ?? ABOUT_DEFAULTS.section1Label,
        section1Heading: row.section1_heading ?? row.section1Heading ?? ABOUT_DEFAULTS.section1Heading,
        section1Text: row.section1_text ?? row.section1Text ?? ABOUT_DEFAULTS.section1Text,
        section1Image: row.section1_image ?? row.section1Image ?? ABOUT_DEFAULTS.section1Image,
        section2Label: row.section2_label ?? row.section2Label ?? ABOUT_DEFAULTS.section2Label,
        section2Heading: row.section2_heading ?? row.section2Heading ?? ABOUT_DEFAULTS.section2Heading,
        section2Text: row.section2_text ?? row.section2Text ?? ABOUT_DEFAULTS.section2Text,
        section2Image: row.section2_image ?? row.section2Image ?? ABOUT_DEFAULTS.section2Image,
        ctaText: row.cta_text ?? row.ctaText ?? ABOUT_DEFAULTS.ctaText,
        ctaLink: row.cta_link ?? row.ctaLink ?? ABOUT_DEFAULTS.ctaLink,
      };
      setForm((prev: any) => prev || v);
    }
  }, [about.loaded, about.value]);

  if (!about.loaded || !form) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const upd = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  const saveAll = async () => {
    setSaving(true);
    const err = await about.save(form);
    if (err) { setMsg("发布失败: " + err); } else { setMsg("已发布！"); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const field = (label: string, key: string, rows = 1) => (
    <div>
      <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">{label}</label>
      {rows > 1 ? (
        <textarea value={form[key] || ""} onChange={(e) => upd(key, e.target.value)} rows={rows} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" />
      ) : (
        <input value={form[key] || ""} onChange={(e) => upd(key, e.target.value)} className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
      )}
    </div>
  );

  const imageField = (label: string, key: string, compress = true) => (
    <div>
      <label className="text-[10px] tracking-label uppercase text-smoke/50 block mb-1">{label}</label>
      <ImageUploader value={form[key] || ""} onChange={(url) => upd(key, url)} compress={compress} />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-lg mb-1">Our Story 页面</h2>
      <p className="text-xs text-smoke/60 mb-6">网站「Our Story」页面的全部内容，图片支持本地上传</p>

      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-medium pt-2">顶部区域</h3>
        {imageField("背景图片（建议宽图，不压缩）", "heroImage", false)}
        {field("顶部小标签", "heroTagline")}
        {field("标题", "heroTitle")}
        <h3 className="text-sm font-medium pt-2">区块一</h3>
        {field("标签", "section1Label")}
        {field("标题", "section1Heading", 2)}
        {field("正文", "section1Text", 4)}
        {imageField("图片", "section1Image")}
        <h3 className="text-sm font-medium pt-2">区块二</h3>
        {field("标签", "section2Label")}
        {field("标题", "section2Heading", 2)}
        {field("正文", "section2Text", 4)}
        {imageField("图片", "section2Image")}
        <h3 className="text-sm font-medium pt-2">底部 CTA</h3>
        {field("按钮文字", "ctaText")}
        {field("按钮链接", "ctaLink")}
      </div>

      <button onClick={saveAll} disabled={saving} className={`btn-primary ${msg ? (msg.includes("失败") ? "bg-red-800 border-0" : "bg-green-800 border-0") : ""}`}>
        {saving ? "发布中..." : (msg || "发布页面")}
      </button>
    </div>
  );
}

// ── Orders Manager ──
const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "待处理", className: "bg-gold/10 text-gold" },
  paid: { label: "已收款", className: "bg-charcoal text-paper" },
  contacted: { label: "已联系", className: "bg-blue-100 text-blue-800" },
  completed: { label: "已完成", className: "bg-green-100 text-green-800" },
};

const PAYMENT_LABELS: Record<string, string> = { paypal: "PayPal", usdt: "USDT" };

function formatOrderTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function toWhatsAppLink(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return "https://wa.me/" + digits;
}

function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (DATA_MODE === "local") {
      setOrders(lsGet<any[]>(LS.orders) || []);
      setLoaded(true);
      return;
    }
    try {
      const { data } = await adminFetch("orders", "list");
      setOrders(data || []);
    } catch (e: any) {
      console.error("[orders] load error:", e?.message || e);
      alert("加载订单失败: " + (e?.message || "未知错误"));
    }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: string) => {
    setBusy(true);
    if (DATA_MODE === "local") {
      const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
      setOrders(next);
      lsSet(LS.orders, next);
      setBusy(false);
      return;
    }
    try {
      await adminFetch("orders", "update", { status }, id);
    } catch (e: any) { alert("更新状态失败: " + (e?.message || "未知错误")); setBusy(false); return; }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm("确定删除该订单吗？删除后无法恢复。")) return;
    setBusy(true);
    if (DATA_MODE === "local") {
      const next = orders.filter((o) => o.id !== id);
      setOrders(next);
      lsSet(LS.orders, next);
      setBusy(false);
      return;
    }
    try {
      await adminFetch("orders", "delete", undefined, id);
    } catch (e: any) { alert("删除失败: " + (e?.message || "未知错误")); setBusy(false); return; }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setBusy(false);
  };

  if (!loaded) return <div className="text-xs text-smoke/40 py-10">加载中...</div>;

  const parseItems = (items: any): any[] => {
    if (Array.isArray(items)) return items;
    try { return JSON.parse(items || "[]"); } catch { return []; }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-lg">客户订单</h2>
          <p className="text-xs text-smoke/60">客户在结算页提交的订单与联系方式{DATA_MODE === "local" ? "（本地存储）" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-smoke">{orders.length} 笔订单</p>
          <button onClick={load} className="btn-outline text-[10px] py-1.5 px-3">刷新</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-xs text-smoke/40 py-10 text-center border border-dashed border-line">暂无订单，客户下单后会显示在这里</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any, i: number) => {
            const items = parseItems(o.items);
            const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
            const isOpen = expanded === o.id;
            const wa = toWhatsAppLink(o.phone || "");
            return (
              <div key={o.id} className="border border-line/50">
                <button onClick={() => setExpanded(isOpen ? null : o.id)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-ivory/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-smoke/40">#{orders.length - i}</span>
                      <p className="text-sm font-medium truncate">{o.first_name} {o.last_name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 ${st.className}`}>{st.label}</span>
                    </div>
                    <p className="text-[11px] text-smoke truncate">{o.email}{o.phone ? ` · ${o.phone}` : ""} · {o.country} · <span className="text-charcoal">{PAYMENT_LABELS[o.payment_method] || "—"}</span></p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm">${(o.total ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-smoke/40">{formatOrderTime(o.created_at)}</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-line/50 p-4 bg-ivory/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs mb-4">
                      <p><span className="text-smoke/40">姓名：</span>{o.first_name} {o.last_name}</p>
                      <p><span className="text-smoke/40">邮箱：</span><a href={`mailto:${o.email}`} className="underline hover:text-charcoal">{o.email}</a></p>
                      <p><span className="text-smoke/40">电话：</span>{o.phone || "—"}</p>
                      <p><span className="text-smoke/40">支付：</span>{PAYMENT_LABELS[o.payment_method] || "—"}{o.payment_method === "usdt" ? "（需核对转账）" : ""}</p>
                      {wa && <p><a href={wa} target="_blank" rel="noreferrer" className="text-green-700 underline">WhatsApp 联系客户 →</a></p>}
                      <p className="md:col-span-2"><span className="text-smoke/40">地址：</span>{[o.address, o.city, o.postal_code, o.country].filter(Boolean).join(", ")}</p>
                    </div>
                    <div className="border border-line/50 mb-4">
                      {items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center px-3 py-2 text-xs border-b border-line/30 last:border-b-0">
                          <span className="truncate mr-4">{it.name}{it.size ? ` (${it.size})` : ""}{it.color ? ` · ${it.color}` : ""} × {it.quantity}</span>
                          <span>${((it.price || 0) * (it.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-3 py-2 text-xs text-smoke bg-ivory/50">
                        <span>小计 ${(o.subtotal ?? 0).toLocaleString()} · 运费 ${(o.shipping ?? 0).toLocaleString()}</span>
                        <span className="font-medium text-charcoal">合计 ${(o.total ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {o.status !== "paid" && o.status !== "contacted" && o.status !== "completed" && <button disabled={busy} onClick={() => setStatus(o.id, "paid")} className="btn-outline text-[10px] py-1.5 px-3">标记已收款</button>}
                      {o.status !== "contacted" && o.status !== "completed" && <button disabled={busy} onClick={() => setStatus(o.id, "contacted")} className="btn-outline text-[10px] py-1.5 px-3">标记已联系</button>}
                      {o.status !== "completed" && <button disabled={busy} onClick={() => setStatus(o.id, "completed")} className="btn-outline text-[10px] py-1.5 px-3">标记已完成</button>}
                      <div className="flex-1" />
                      <button disabled={busy} onClick={() => remove(o.id)} className="text-[10px] py-1.5 px-3 text-red-600 border border-red-200 hover:bg-red-50">删除订单</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
