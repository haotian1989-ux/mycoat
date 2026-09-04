"use client";

import { useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { optimizeImage } from "@/lib/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  hover?: boolean;
}

export default function ImageLightbox({ src, alt, className = "", hover = true }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const optimizedSrc = optimizeImage(src);

  const toggleLightbox = useCallback(() => setOpen((o) => !o), []);
  const toggleZoom = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomed((z) => !z);
  }, []);

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
            onClick={toggleLightbox}
            className="absolute top-6 right-6 text-paper/60 hover:text-paper transition-colors z-10"
          >
            <X size={24} strokeWidth={1} />
          </button>
          <button
            onClick={toggleZoom}
            className="absolute top-6 right-16 text-paper/60 hover:text-paper transition-colors z-10"
          >
            {zoomed ? <ZoomOut size={24} strokeWidth={1} /> : <ZoomIn size={24} strokeWidth={1} />}
          </button>
          <img
            src={optimizedSrc}
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
