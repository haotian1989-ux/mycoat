"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Truck } from "lucide-react";
import { useCart } from "@/components/CartContext";
import Reviews from "@/components/Reviews";
import ImageLightbox from "@/components/ImageLightbox";
import { optimizeImage } from "@/lib/image";
import { Product } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/config";

const BASE = SITE_URL;

export default function ProductDetail({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const productUrl = `${BASE}/product/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: productUrl,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const nextImg = () => setImgIndex((i) => (i + 1) % product.images.length);
  const prevImg = () => setImgIndex((i) => (i - 1 + product.images.length) % product.images.length);

  const handleAdd = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size first.");
      return;
    }
    dispatch({ type: "ADD_ITEM", product, color: selectedColor || product.colors[0], size: selectedSize || product.sizes[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-padding py-10 md:py-20">
        <nav className="text-[11px] text-smoke/60 tracking-label mb-10">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span className="mx-2.5">/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-charcoal transition-colors capitalize">{product.category}</Link>
          <span className="mx-2.5">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          <div className="min-w-0">
            <div className="aspect-[3/4] overflow-hidden bg-ivory/50 relative group">
              {optimizeImage(product.images[imgIndex]) && <ImageLightbox src={optimizeImage(product.images[imgIndex])} alt={product.name} />}
              {product.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 bg-paper/90 backdrop-blur p-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><ChevronLeft size={16} /></button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 bg-paper/90 backdrop-blur p-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><ChevronRight size={16} /></button>
                </>
              )}
              {product.newArrival && <span className="absolute top-4 left-4 bg-gold text-paper px-3 py-1.5 text-[10px] tracking-label uppercase font-semibold">New</span>}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`w-16 h-20 flex-shrink-0 ${i === imgIndex ? "ring-1 ring-charcoal ring-offset-2" : "opacity-50 hover:opacity-80"}`}>
                    <img src={optimizeImage(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {product.video && (
              <div className="mt-6">
                <div className="aspect-[9/16] max-w-[320px] mx-auto overflow-hidden bg-night relative">
                  <video
                    src={product.video}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    poster={optimizeImage(product.images[0])}
                  />
                </div>
                <p className="text-[10px] tracking-label uppercase text-smoke/50 text-center mt-2">
                  Product Video
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="section-label capitalize">{product.category === "men" ? "Men" : product.category === "unisex" ? "Unisex" : "Women"}</p>
            <h1 className="font-serif text-2xl md:text-3xl mt-3 mb-4">{product.name}</h1>
            <p className="text-xl font-light mb-6">${product.price.toLocaleString()}</p>
            <p className="body-text mb-8">{product.description}</p>

            {product.colors.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] tracking-label uppercase text-smoke/60 mb-3">
                  Color · <span className="text-charcoal">{selectedColor || product.colors[0]}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-5 py-2.5 text-xs tracking-label border transition-colors duration-300 ${
                        (selectedColor || product.colors[0]) === c ? "border-charcoal bg-charcoal text-paper" : "border-line hover:border-charcoal/50"
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] tracking-label uppercase text-smoke/60 mb-3">
                  Size · <span className="text-charcoal">{selectedSize || "Select"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-5 py-2.5 text-xs tracking-label border transition-colors duration-300 ${
                        selectedSize === s ? "border-charcoal bg-charcoal text-paper" : "border-line hover:border-charcoal/50"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAdd} disabled={!product.inStock}
              className={`btn-primary w-full md:w-auto mb-6 ${added ? "bg-green-800 hover:bg-green-800 border-0" : ""}`}>
              {added ? (<><Check size={15} className="mr-2" /> Added to Bag</>) : product.inStock ? "Add to Bag" : "Out of Stock"}
            </button>

            <div className="flex items-center gap-2 text-xs text-smoke/60 mb-10">
              <Truck size={14} strokeWidth={1.5} />
              <span>Free worldwide shipping on orders over $200</span>
            </div>

            <div className="border-t border-line pt-8 space-y-5">
              {product.materials && <div><h3 className="text-[11px] tracking-label uppercase text-smoke/40 mb-2">Materials</h3><p className="text-sm text-smoke">{product.materials}</p></div>}
              {product.dimensions && <div><h3 className="text-[11px] tracking-label uppercase text-smoke/40 mb-2">Fit & Sizing</h3><p className="text-sm text-smoke">{product.dimensions}</p></div>}
              {product.details.length > 0 && (
                <div>
                  <h3 className="text-[11px] tracking-label uppercase text-smoke/40 mb-2">Details</h3>
                  <ul className="text-sm text-smoke space-y-1.5">
                    {product.details.map((d, i) => <li key={i} className="flex gap-2"><span className="text-gold mt-0.5">·</span>{d}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <Reviews productId={product.id} productName={product.name} />
      </div>
    </>
  );
}
