"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Come funziona il modello Privatio per le agenzie?",
    a: "Privatio raccoglie venditori privati che vogliono vendere il proprio immobile. Li qualifichiamo e ti inviamo la segnalazione come lead. Tu contatti il venditore, valuti l'immobile e gestisci l'eventuale incarico in autonomia. Privatio non interviene nella mediazione.",
  },
  {
    q: "Quanto costa l'abbonamento?",
    a: "Il costo dipende dal piano scelto e dalla zona in cui operi. I piani vanno da Base (a partire da €200/mese per 1 area) fino a Premier Elite (a partire da €1.800/mese per fino a 12 aree). Il prezzo varia in base al valore di mercato della zona. Nessun costo aggiuntivo sulle vendite.",
  },
  {
    q: "Come ricevo i lead?",
    a: "Quando un venditore nella tua zona si registra su Privatio, ricevi una segnalazione nella tua dashboard con i dati del venditore e dell'immobile. Sta a te contattarlo e gestire il rapporto professionale.",
  },
  {
    q: "Privatio e un mediatore immobiliare?",
    a: "No. Privatio e una piattaforma tecnologica di lead generation. Non svolgiamo attivita di mediazione immobiliare. Ti forniamo segnalazioni di potenziali clienti venditori; il rapporto professionale e contrattuale lo gestisci direttamente tu.",
  },
  {
    q: "Posso disdire l'abbonamento in qualsiasi momento?",
    a: "Assolutamente si. L'abbonamento e mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard. I lead gia ricevuti restano tuoi.",
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
