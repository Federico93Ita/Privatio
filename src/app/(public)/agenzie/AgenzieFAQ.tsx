"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Come funziona la lista d'attesa?",
    a: "Compilando il modulo entri in lista d'attesa per la tua zona. Quando le iscrizioni apriranno nella tua area, sarai tra i primi a essere contattato per riservare il tuo territorio. I posti sono limitati per ogni zona.",
  },
  {
    q: "Come funziona il modello Privatio per le agenzie?",
    a: "Privatio raccoglie venditori privati che vogliono vendere il proprio immobile. I venditori nella tua zona ti trovano e ti contattano direttamente dalla piattaforma. Il rapporto professionale lo gestisci in totale autonomia. Privatio non interviene nella mediazione.",
  },
  {
    q: "Come sono suddivise le zone?",
    a: "Ogni metro quadrato d'Italia appartiene a una sola zona. I comuni piccoli (< 5.000 ab.) sono raggruppati geograficamente in aree da 5-20.000 abitanti. I comuni medi (20k-100k) sono zone singole. Le grandi citta (> 100k) sono suddivise in quartieri basati sui dati OMI. Nessuna sovrapposizione, nessun buco.",
  },
  {
    q: "Quanto costa l'abbonamento?",
    a: "Il prezzo dipende dalla zona: da \u20AC224/mese per zone rurali fino a \u20AC2.340/mese per i centri storici. Questi sono i Prezzi Fondatore, riservati a chi si iscrive durante il lancio, bloccati per il primo anno con uno sconto del 10%. In pi\u00F9, i primi 3 mesi sono completamente gratuiti. Nessun costo aggiuntivo sulle vendite.",
  },
  {
    q: "Cosa succede dopo i 3 mesi gratuiti?",
    a: "Dopo i 3 mesi gratuiti, parte l'abbonamento mensile al Prezzo Fondatore (-10%) che resta bloccato per 12 mesi dall'iscrizione. Puoi disdire in qualsiasi momento, senza vincoli e senza penali.",
  },
  {
    q: "Posso scegliere piu zone?",
    a: "Si, puoi attivare fino a 3 zone contemporaneamente. Dopo la prima zona (quella della tua sede), puoi espanderti solo su zone limitrofe \u2014 cosi la tua copertura territoriale rimane coerente e efficace.",
  },
  {
    q: "Il posto e garantito?",
    a: "Il posto viene riservato in ordine di iscrizione. Ogni zona ha un numero massimo di agenzie (da 3 a 7 a seconda della zona). Una volta raggiunto il limite, la zona non e piu disponibile fino a eventuali disdette.",
  },
  {
    q: "Privatio e un mediatore immobiliare?",
    a: "No. Privatio e una piattaforma tecnologica di lead generation. Non svolgiamo attivita di mediazione immobiliare. Ti forniamo segnalazioni di potenziali clienti venditori; il rapporto contrattuale lo gestisci direttamente tu.",
  },
  {
    q: "Posso disdire l'abbonamento in qualsiasi momento?",
    a: "Si. L'abbonamento e mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard. I lead gia ricevuti restano tuoi.",
  },
];

export default function AgenzieFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-xl border border-border bg-white overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-medium text-primary-dark pr-4">{faq.q}</span>
            <svg
              className={`h-5 w-5 flex-shrink-0 text-text-muted transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4 text-sm leading-relaxed text-text-muted">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
