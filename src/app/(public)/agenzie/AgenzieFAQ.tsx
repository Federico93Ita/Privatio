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
    q: "Quanto costa l'abbonamento?",
    a: "Il prezzo dipende dalla zona. Ogni territorio ha un prezzo fisso e trasparente: da €300/mese per zone rurali fino a €3.200/mese per le microzone premium nelle grandi città. Pagando annualmente risparmi il 15%. Nessun costo aggiuntivo sulle vendite.",
  },
  {
    q: "Il posto è garantito?",
    a: "Il posto viene riservato in ordine di iscrizione. Ogni zona ha un numero massimo di agenzie (da 3 a 6 a seconda del tipo di territorio). Una volta raggiunto il limite, la zona non è più disponibile fino a eventuali disdette.",
  },
  {
    q: "Privatio è un mediatore immobiliare?",
    a: "No. Privatio è una piattaforma tecnologica di lead generation. Non svolgiamo attività di mediazione immobiliare. Ti forniamo segnalazioni di potenziali clienti venditori; il rapporto contrattuale lo gestisci direttamente tu.",
  },
  {
    q: "Posso disdire l'abbonamento in qualsiasi momento?",
    a: "Sì. L'abbonamento è mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard. I lead già ricevuti restano tuoi. Con l'abbonamento annuale risparmi il 15%.",
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
