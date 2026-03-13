"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryPhoto {
  url: string;
  order: number;
}

interface PropertyGalleryProps {
  photos: GalleryPhoto[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PropertyGallery({ photos }: PropertyGalleryProps) {
  const sorted = [...photos].sort((a, b) => a.order - b.order);
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
    return (
      <div className="aspect-[16/9] rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary/[0.03] via-bg-soft to-primary/[0.06]">
        {/* Decorative SVG grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="placeholder-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#placeholder-grid)" className="text-primary" />
        </svg>

        {/* Corner frame accents */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary/10 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary/10 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary/10 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary/10 rounded-br-lg" />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Camera icon in card with pulse ring */}
          <div className="relative mb-5">
            <div className="absolute inset-0 -m-3 rounded-full border border-primary/10 animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border flex items-center justify-center">
              <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </div>

          {/* "Coming soon" badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            Prossimamente
          </span>

          {/* Text */}
          <p className="text-sm font-medium text-text/70">Foto non ancora disponibili</p>
          <p className="text-xs text-text-muted/50 mt-1">Le immagini saranno pubblicate a breve</p>
        </div>
      </div>
    );
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
