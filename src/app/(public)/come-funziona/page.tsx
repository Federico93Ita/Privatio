import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Come Funziona",
  description: "Scopri come vendere casa senza pagare commissioni con Privatio. 3 semplici passaggi.",
};

const steps = [
  {
    num: "01",
    title: "Inserisci il tuo immobile",
    desc: "Registrati gratuitamente e carica le informazioni del tuo immobile: foto, descrizione, prezzo richiesto. Ci vogliono solo 5 minuti.",
    details: ["Registrazione gratuita", "Upload foto e descrizione", "Nessun impegno iniziale"],
  },
  {
    num: "02",
    title: "Scegli l'agenzia nella tua zona",
    desc: "Nella tua dashboard trovi la lista delle agenzie partner verificate nella tua zona. Sei tu a scegliere quale contattare per valutare il tuo immobile. Se non contatti nessuno entro 48 ore, le agenzie della tua zona potranno contattarti direttamente.",
    details: ["Sei tu a scegliere l'agenzia", "Agenzie verificate e selezionate", "Copertura su tutto il territorio"],
  },
  {
    num: "03",
    title: "L'agenzia gestisce tutto",
    desc: "L'agenzia partner si occupa di sopralluogo, foto professionali, pubblicazione annuncio, visite con acquirenti e trattativa.",
    details: ["Sopralluogo e valutazione", "Pubblicazione su tutti i portali", "Gestione visite e trattativa"],
  },
  {
    num: "04",
    title: "Tu incassi il 100%",
    desc: "Alla vendita, incassi l'intero prezzo pattuito. Le agenzie convenzionate Privatio si impegnano a non addebitare provvigioni al venditore.",
    details: ["Zero costi per il venditore su Privatio", "Zero provvigioni dall'agenzia convenzionata", "Massima trasparenza"],
  },
];

export default function ComeFunzionaPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-light tracking-[-0.03em] text-text md:text-5xl mb-6">Come funziona</h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Vendere casa senza commissioni è semplice. Ecco come Privatio rivoluziona la vendita immobiliare in Italia.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-4">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.num} className={`flex flex-col md:flex-row gap-8 items-start ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-medium text-primary">{step.num}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medium text-text mb-3">{step.title}</h2>
                  <p className="text-text-muted text-lg mb-4">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-text">
                        <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commission explanation */}
        <section className="bg-bg-soft py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-light tracking-[-0.03em] text-text text-center mb-8">Chi paga cosa?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-success">
                <h3 className="text-xl font-medium text-success mb-2">Per il Venditore</h3>
                <p className="text-5xl font-semibold text-success mb-2">€0</p>
                <p className="text-text-muted">Né Privatio né l&apos;agenzia convenzionata ti chiedono provvigioni. Vendi casa a costo zero.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-border">
                <h3 className="text-xl font-medium text-text mb-2">Per l&apos;Agenzia</h3>
                <p className="text-5xl font-semibold text-primary mb-2">Abbonamento</p>
                <p className="text-text-muted">Le agenzie pagano un abbonamento territoriale a Privatio. Nessuna commissione sulle vendite.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-light tracking-[-0.03em] text-text mb-4">Pronto a vendere?</h2>
            <p className="text-text-muted text-lg mb-8">
              Inserisci il tuo immobile gratuitamente e inizia il percorso verso la vendita senza commissioni.
            </p>
            <Link
              href="/vendi"
              className="inline-block px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/85 transition-colors"
            >
              Inserisci il tuo immobile gratis
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
