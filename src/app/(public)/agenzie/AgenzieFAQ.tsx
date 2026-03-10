"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Come funziona il modello Privatio per le agenzie?",
    a: "Privatio raccoglie venditori privati che vogliono vendere senza pagare commissioni. Li qualifichiamo e li assegniamo alla tua agenzia. Tu gestisci la vendita e guadagni una provvigione del 1.5-2% pagata dall'acquirente.",
  },
  {
    q: "Quanto costa l'abbonamento?",
    a: "Il Piano Base costa €49/mese (max 5 immobili attivi). Il Piano Pro costa €99/mese con immobili illimitati, priorità di assegnazione e supporto dedicato. Nessun costo aggiuntivo sulle provvigioni.",
  },
  {
    q: "Come vengono assegnati gli immobili?",
    a: "Il nostro algoritmo assegna automaticamente gli immobili all'agenzia più vicina e con maggiore disponibilità. Consideriamo la distanza, il carico di lavoro e la valutazione dell'agenzia.",
  },
  {
    q: "Il contratto di esclusiva è già firmato dal venditore?",
    a: "Sì. Prima dell'assegnazione, il venditore firma un contratto di esclusiva digitale della durata di 90 giorni. Lavori con la tranquillità di un mandato in esclusiva.",
  },
  {
    q: "Posso disdire l'abbonamento in qualsiasi momento?",
    a: "Assolutamente sì. L'abbonamento è mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard. Gli immobili già assegnati rimangono fino alla conclusione del mandato.",
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
