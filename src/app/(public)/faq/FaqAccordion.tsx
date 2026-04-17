"use client";

import { useState } from "react";

type Item = { q: string; a: string };

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-3xl border border-[#C9A84C]/[0.12] bg-white overflow-hidden">
      {items.map((faq, i) => (
        <div
          key={i}
          className={i < items.length - 1 ? "border-b border-[#C9A84C]/[0.08]" : ""}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#F8F6F1]/60 sm:px-8 sm:py-6"
            aria-expanded={openIndex === i}
          >
            <span className="pr-4 font-heading text-base font-normal text-[#0B1D3A] sm:text-lg">
              {faq.q}
            </span>
            <svg
              className={`h-5 w-5 flex-shrink-0 text-[#C9A84C] transition-transform duration-300 ${
                openIndex === i ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openIndex === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-[#0B1D3A]/70 sm:px-8 sm:pb-6">
                {faq.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
