"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDemoImages } from "@/lib/demo-images";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryPhoto {
  url: string;
  order: number;
}

interface PropertyGalleryProps {
  photos: GalleryPhoto[];
  propertyType?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PropertyGallery({ photos, propertyType }: PropertyGalleryProps) {
  // Use demo images when no real photos exist
  const demoUrls = photos.length === 0 ? getDemoImages(propertyType || "") : [];
  const isDemo = demoUrls.length > 0;
  const sorted = isDemo
    ? demoUrls.map((url, i) => ({ url, order: i }))
    : [...photos].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const current = sorted[activeIndex];

  /* Navigation helpers */
  const goTo = useCallback(
    (index: number) => {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex]
  );

  const goPrev = useCallback(() => {
    const prev = activeIndex === 0 ? sorted.length - 1 : activeIndex - 1;
    setDirection(-1);
    setActiveIndex(prev);
  }, [activeIndex, sorted.length]);

  const goNext = useCallback(() => {
    const next = activeIndex === sorted.length - 1 ? 0 : activeIndex + 1;
    setDirection(1);
    setActiveIndex(next);
  }, [activeIndex, sorted.length]);

  /* Keyboard handling for lightbox */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setLightboxOpen(false);
    },
    [goPrev, goNext]
  );

  if (sorted.length === 0) {
    return null;
  }

  /* Framer-motion slide variants */
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <>
      {/* ---- Main photo ---- */}
      <div className="space-y-3">
        <div
          className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-bg-soft cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Apri galleria a schermo intero"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
          }}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current.url}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={current.url}
                alt={`Foto ${activeIndex + 1} di ${sorted.length}`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Photo counter */}
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {sorted.length}
          </span>

          {/* Demo badge */}
          {isDemo && (
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              Foto illustrativa
            </span>
          )}

          {/* Expand icon */}
          <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </span>
        </div>

        {/* ---- Thumbnail strip ---- */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {sorted.map((photo, idx) => (
              <button
                key={`${photo.url}-${idx}`}
                onClick={() => goTo(idx)}
                className={cn(
                  "relative shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-200",
                  idx === activeIndex
                    ? "ring-2 ring-primary ring-offset-2 opacity-100"
                    : "opacity-60 hover:opacity-100"
                )}
                aria-label={`Foto ${idx + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  sizes="80px"
                  loading="lazy"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Lightbox modal ---- */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-label="Galleria foto a schermo intero"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors p-2"
              aria-label="Chiudi galleria"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev arrow */}
            {sorted.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 z-10 text-white/80 hover:text-white transition-colors p-2 rounded-full bg-black/30 hover:bg-black/50"
                aria-label="Foto precedente"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Main lightbox image */}
            <div
              className="relative w-[90vw] h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current.url}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.url}
                    alt={`Foto ${activeIndex + 1} di ${sorted.length}`}
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next arrow */}
            {sorted.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 z-10 text-white/80 hover:text-white transition-colors p-2 rounded-full bg-black/30 hover:bg-black/50"
                aria-label="Foto successiva"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}

            {/* Counter */}
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {activeIndex + 1} / {sorted.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
