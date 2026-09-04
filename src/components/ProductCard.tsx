"use client";
import { optimizeImage } from "@/lib/image";

import Link from "next/link";
import { useCart } from "./CartContext";
import { Product } from "@/lib/types";
import ImageLightbox from "./ImageLightbox";

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();

  return (
    <div className="group">
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-[3/4] overflow-hidden bg-ivory/60 mb-5 group-hover:shadow-xl group-hover:shadow-charcoal/5 transition-shadow duration-500"
      >
        <ImageLightbox
          src={optimizeImage(product.images[0])}
          alt={product.name}
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.newArrival && (
          <span className="absolute top-4 left-4 bg-gold text-paper px-3 py-1.5 text-[10px] tracking-label uppercase font-semibold">
            New Arrival
          </span>
        )}
        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-400 flex items-end justify-end p-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: "ADD_ITEM", product });
            }}
            className="bg-charcoal text-paper px-4 py-2.5 text-[10px] tracking-label uppercase font-semibold 
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-400 
                       translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0
                       hover:bg-gold"
          >
            Add to Bag
          </button>
        </div>
      </Link>

      <Link href={`/product/${product.slug}`} className="block">
        <h3 className="font-serif text-sm md:text-base mb-1.5 hover:text-gold transition-colors">
          {product.name}
        </h3>
      </Link>
      <p className="text-sm text-smoke tracking-wide">
        <span className="text-[10px] text-muted mr-0.5">$</span>
        {product.price.toLocaleString()}
      </p>
    </div>
  );
}
