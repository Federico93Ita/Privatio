"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

const faqs = [
  {
    question: "Devo pagare qualcosa per vendere?",
    answer:
      "No, il servizio è completamente gratuito per il venditore. Né Privatio né l'agenzia convenzionata ti chiedono provvigioni. L'intero ricavato della vendita è tuo.",
  },
  {
    question: "Quanto tempo ci vuole?",
    answer:
      "Inserire il tuo immobile richiede circa 5 minuti. Nella tua dashboard trovi subito la lista delle agenzie partner nella tua zona: sei tu a scegliere quale contattare. L'agenzia si occuperà di tutto: pubblicazione, visite, trattativa e documentazione.",
  },
  {
    question: "Come guadagna Privatio?",
    answer:
      "Le agenzie partner pagano un abbonamento per essere presenti sulla piattaforma. Privatio non trattiene commissioni sulle vendite e non chiede nulla ai venditori.",
  },
  {
    question: "Posso ritirare il mio annuncio?",
    answer:
      "Sì, puoi ritirare il tuo annuncio in qualsiasi momento dalla tua dashboard. Nessun vincolo, nessuna penale.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#F8F6F1] py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">
              Domande frequenti
            </span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
              Hai qualche dubbio?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 sm:text-lg leading-relaxed">
              Le risposte alle domande più comuni sul nostro servizio.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-3xl border border-[#C9A84C]/[0.08] bg-white overflow-hidden">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={index < faqs.length - 1 ? "border-b border-[#C9A84C]/[0.08]" : ""}
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200 hover:bg-[#F8F6F1]/50 sm:px-8 sm:py-6"
                  aria-expanded={openIndex === index}
                >
                  <span className="pr-4 font-heading text-base font-normal text-[#0B1D3A] sm:text-lg">
                    {faq.question}
                  </span>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-[#C9A84C] transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
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
                    openIndex === index
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-[#0B1D3A]/50 sm:px-8 sm:pb-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-12 text-center">
            <p className="text-base text-[#0B1D3A]/50">
              Hai altre domande?{" "}
              <Link
                href="/contatti"
                className="inline-flex items-center gap-1 font-medium text-[#C9A84C] transition-colors duration-200 hover:text-[#D4B65E]"
              >
                Contattaci
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
