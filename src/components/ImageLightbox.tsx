"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { optimizeImage } from "@/lib/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  hover?: boolean;
  images?: string[];
  index?: number;
}

export default function ImageLightbox({ src, alt, className = "", hover = true, images, index = 0 }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [idx, setIdx] = useState(index);
  const optimizedSrc = optimizeImage(src);
  const list = images && images.length > 0 ? images : [src];

  useEffect(() => {
    if (open) {
      setIdx(Math.max(0, Math.min(index, list.length - 1)));
      setZoomed(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLightbox = useCallback(() => setOpen((o) => !o), []);
  const toggleZoom = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomed((z) => !z);
  }, []);

  const go = useCallback((e: React.MouseEvent, dir: number) => {
    e.stopPropagation();
    setIdx((i) => (i + dir + list.length) % list.length);
    setZoomed(false);
  }, [list.length]);

  const currentSrc = optimizeImage(list[idx]);

  if (!optimizedSrc) return <div className={className} />;

  return (
    <>
      <div
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        onClick={toggleLightbox}
      >
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover ${
            hover ? "hover:scale-105 transition-transform duration-700 ease-out" : ""
          }`}
        />
        {hover && (
          <div className="absolute inset-0 bg-charcoal/0 hover:bg-charcoal/10 transition-colors duration-400 flex items-center justify-center">
            <ZoomIn size={20} className="text-paper opacity-0 hover:opacity-100 transition-opacity" strokeWidth={1} />
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={toggleLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleLightbox(); }}
            className="absolute top-6 right-6 text-paper/60 hover:text-paper transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} strokeWidth={1} />
          </button>
          <button
            onClick={toggleZoom}
            className="absolute top-6 right-16 text-paper/60 hover:text-paper transition-colors z-10"
            aria-label="Zoom"
          >
            {zoomed ? <ZoomOut size={24} strokeWidth={1} /> : <ZoomIn size={24} strokeWidth={1} />}
          </button>
          {list.length > 1 && (
            <>
              <button
                onClick={(e) => go(e, -1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-paper/10 hover:bg-paper/25 text-paper p-3 rounded-full transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => go(e, 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-paper/10 hover:bg-paper/25 text-paper p-3 rounded-full transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} strokeWidth={1.5} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-paper/60 text-xs tracking-label">
                {idx + 1} / {list.length}
              </span>
            </>
          )}
          <img
            src={currentSrc}
            alt={alt}
            onClick={toggleZoom}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
        </div>
      )}
    </>
  );
}
