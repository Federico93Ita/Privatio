import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Come Funziona",
  description: "Scopri come vendere casa senza pagare commissioni con Privatio. 4 semplici passaggi.",
};

const steps = [
  {
    num: "01",
    title: "Inserisci il tuo immobile",
    desc: "Registrati gratuitamente e carica le informazioni del tuo immobile: foto, descrizione, prezzo richiesto. Ci vogliono solo 5 minuti.",
    details: ["Registrazione gratuita", "Upload foto e descrizione", "Nessun impegno iniziale"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Scegli l'agenzia nella tua zona",
    desc: "Nella tua dashboard trovi la lista delle agenzie partner verificate nella tua zona. Sei tu a scegliere quale contattare per valutare il tuo immobile. Se non contatti nessuno entro 48 ore, le agenzie della tua zona potranno contattarti direttamente.",
    details: ["Sei tu a scegliere l'agenzia", "Agenzie verificate e selezionate", "Copertura su tutto il territorio"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "L'agenzia gestisce tutto",
    desc: "L'agenzia partner si occupa di sopralluogo, foto professionali, pubblicazione annuncio, visite con acquirenti e trattativa.",
    details: ["Sopralluogo e valutazione", "Pubblicazione su tutti i portali", "Gestione visite e trattativa"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Tu incassi il 100%",
    desc: "Alla vendita, incassi l'intero prezzo pattuito. Le agenzie convenzionate Privatio si impegnano a non addebitare provvigioni al venditore.",
    details: ["Zero costi per il venditore su Privatio", "Zero provvigioni dall'agenzia convenzionata", "Massima trasparenza"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function ComeFunzionaPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="relative bg-[#0B1D3A] pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden grain">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8F6F1] to-transparent" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-5">Il processo</span>
            <h1 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white md:text-6xl mb-6">Come funziona</h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed md:text-xl">
              Vendere casa senza commissioni è semplice. Ecco come Privatio rivoluziona la vendita immobiliare in Italia.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4">
            <div className="space-y-8 md:space-y-0">
              {steps.map((step, i) => (
                <div key={step.num} className={`flex flex-col md:flex-row gap-8 md:gap-12 items-start ${i % 2 === 1 ? "md:flex-row-reverse" : ""} ${i > 0 ? "md:mt-16" : ""}`}>
                  {/* Number + Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-sm border border-[#C9A84C]/10">
                        <span className="text-3xl font-semibold bg-gradient-to-br from-[#C9A84C] to-[#B8943B] bg-clip-text text-transparent">{step.num}</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-3 md:text-3xl">{step.title}</h2>
                    <p className="text-[#0B1D3A]/50 text-base leading-relaxed mb-5">{step.desc}</p>
                    <ul className="space-y-2.5">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3 text-[#0B1D3A]/70">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission explanation */}
        <section className="relative bg-white py-24 md:py-32 overflow-hidden">
          <div className="absolute left-[-5%] top-[20%] w-48 h-48 rounded-full bg-[#C9A84C]/[0.03] blur-[60px]" />

          <div className="relative max-w-4xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Trasparenza totale</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Chi paga cosa?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-8 text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <span className="text-2xl font-bold text-emerald-600">0%</span>
                </div>
                <h3 className="font-heading text-xl font-normal text-[#0B1D3A] mb-2">Per il Venditore</h3>
                <p className="text-4xl font-semibold text-emerald-600 mb-3">€0</p>
                <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">Né Privatio né l&apos;agenzia convenzionata ti chiedono provvigioni. Vendi casa a costo zero.</p>
              </div>
              <div className="relative rounded-3xl border border-[#C9A84C]/15 bg-white p-8 text-center shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C9A84C]/10">
                  <svg className="h-7 w-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-normal text-[#0B1D3A] mb-2">Per l&apos;Agenzia</h3>
                <p className="text-2xl font-semibold text-[#0B1D3A] mb-3">Abbonamento</p>
                <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">Le agenzie pagano un abbonamento territoriale a Privatio. Nessuna commissione sulle vendite.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-[#0B1D3A] py-24 md:py-32 overflow-hidden grain">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#C9A84C]/[0.04] blur-[80px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/60 mb-4">Inizia ora</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white mb-5 sm:text-5xl">Pronto a vendere?</h2>
            <p className="text-white/40 text-lg mb-10 leading-relaxed">
              Inserisci il tuo immobile gratuitamente e inizia il percorso verso la vendita senza commissioni.
            </p>
            <Link
              href="/vendi"
              className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="relative z-10">Inserisci il tuo immobile gratis</span>
              <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
