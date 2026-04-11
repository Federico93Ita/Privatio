"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  /** Current image URL (if already uploaded) */
  value: string | null;
  /** Called with the uploaded URL */
  onChange: (url: string | null) => void;
  /** Subfolder in storage (e.g. "logo", "cover", "gallery") */
  folder?: string;
  /** Aspect ratio class (e.g. "aspect-square", "aspect-video") */
  aspect?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show a remove button */
  removable?: boolean;
  /** Additional className for the container */
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = "general",
  aspect = "aspect-square",
  placeholder = "Trascina un'immagine o clicca per caricare",
  removable = true,
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Errore nel caricamento");
          return;
        }

        onChange(data.url);
      } catch {
        setError("Errore di rete");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Solo immagini (JPG, PNG, WebP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Massimo 5 MB");
        return;
      }
      upload(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        /* ── Preview ── */
        <div className={`relative ${aspect} rounded-xl overflow-hidden border border-[#0B1D3A]/10 group`}>
          <Image
            src={value}
            alt="Upload"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-[#0B1D3A] shadow-lg hover:bg-gray-50"
            >
              Sostituisci
            </button>
            {removable && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white shadow-lg hover:bg-red-600"
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`${aspect} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#C9A84C] bg-[#C9A84C]/5"
              : "border-[#0B1D3A]/15 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#0B1D3A]/50">Caricamento...</span>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-[#0B1D3A]/20 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
              <span className="text-xs text-[#0B1D3A]/40 text-center px-4">
                {placeholder}
              </span>
              <span className="text-[10px] text-[#0B1D3A]/25 mt-1">
                JPG, PNG, WebP — max 5 MB
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
    </div>
  );
}

/* ── Multi-image gallery uploader ── */

interface GalleryUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  max?: number;
}

export function GalleryUploader({
  value,
  onChange,
  folder = "gallery",
  max = 20,
}: GalleryUploaderProps) {
  const addUrl = useCallback(
    (url: string | null) => {
      if (url && value.length < max) {
        onChange([...value, url]);
      }
    },
    [value, onChange, max]
  );

  const removeAt = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#0B1D3A]/10 group">
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              className="object-cover"
              sizes="200px"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
              X
            </button>
          </div>
        ))}

        {value.length < max && (
          <ImageUploader
            value={null}
            onChange={addUrl}
            folder={folder}
            aspect="aspect-[4/3]"
            placeholder="Aggiungi foto"
            removable={false}
          />
        )}
      </div>
      <p className="text-xs text-[#0B1D3A]/30 mt-2">
        {value.length}/{max} foto caricate
      </p>
    </div>
  );
}
