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
    title: "Ti assegniamo un'agenzia locale",
    desc: "Il nostro algoritmo seleziona l'agenzia partner più adatta nella tua zona, in base a disponibilità, valutazioni e vicinanza.",
    details: ["Matchmaking automatico", "Agenzie verificate e selezionate", "Copertura su tutto il territorio"],
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
    desc: "Alla vendita, incassi l'intero prezzo pattuito. La commissione del 2-2.5% viene pagata dall'acquirente, non da te.",
    details: ["Zero commissioni per il venditore", "Commissione acquirente trasparente", "Contratto digitale tutelante"],
  },
];

export default function ComeFunzionaPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0a1f44] to-[#0e8ff1] text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-heading text-4xl md:text-6xl mb-6">COME FUNZIONA</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
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
                  <div className="w-20 h-20 rounded-2xl bg-[#0e8ff1]/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#0e8ff1]">{step.num}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#0a1f44] mb-3">{step.title}</h2>
                  <p className="text-[#64748b] text-lg mb-4">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-[#1e293b]">
                        <svg className="w-5 h-5 text-[#10b981] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section className="bg-[#f8fafc] py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-3xl text-[#0a1f44] text-center mb-8">CHI PAGA COSA?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-[#10b981]">
                <h3 className="text-xl font-bold text-[#10b981] mb-2">Venditore</h3>
                <p className="text-5xl font-bold text-[#10b981] mb-2">0%</p>
                <p className="text-[#64748b]">Nessuna commissione, nessun costo nascosto. Incassi il 100% del prezzo di vendita.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                <h3 className="text-xl font-bold text-[#0a1f44] mb-2">Acquirente</h3>
                <p className="text-5xl font-bold text-[#0e8ff1] mb-2">2 - 2.5%</p>
                <p className="text-[#64748b]">L&apos;acquirente paga una commissione ridotta sul prezzo di vendita. Trasparenza totale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="font-heading text-3xl text-[#0a1f44] mb-4">PRONTO A VENDERE?</h2>
            <p className="text-[#64748b] text-lg mb-8">
              Inserisci il tuo immobile gratuitamente e inizia il percorso verso la vendita senza commissioni.
            </p>
            <Link
              href="/vendi"
              className="inline-block px-8 py-4 bg-[#0e8ff1] text-white rounded-xl text-lg font-semibold hover:bg-[#0a1f44] transition-colors"
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
