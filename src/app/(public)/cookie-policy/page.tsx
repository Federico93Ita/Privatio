import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Cookie Policy",
  description: "Informativa sull'utilizzo dei cookie su Privatio.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-heading text-3xl text-[#0a1f44] mb-8">COOKIE POLICY</h1>
          <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] prose prose-slate max-w-none">
            <p className="text-sm text-[#64748b]">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">1. Cosa sono i cookie</h2>
            <p className="text-[#64748b]">
              I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell&apos;utente
              durante la navigazione sul sito web.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">2. Cookie utilizzati</h2>

            <h3 className="text-base font-semibold text-[#0a1f44] mt-4">Cookie tecnici (necessari)</h3>
            <p className="text-[#64748b]">
              Essenziali per il funzionamento del sito: sessione utente, preferenze, sicurezza.
              Non richiedono consenso.
            </p>

            <h3 className="text-base font-semibold text-[#0a1f44] mt-4">Cookie analitici</h3>
            <p className="text-[#64748b]">
              Utilizziamo Google Analytics 4 per analizzare il traffico del sito in forma aggregata.
              I dati sono anonimizzati e utilizzati solo per migliorare il servizio.
            </p>

            <h3 className="text-base font-semibold text-[#0a1f44] mt-4">Cookie di marketing</h3>
            <p className="text-[#64748b]">
              Utilizziamo Meta Pixel per campagne pubblicitarie mirate.
              Questi cookie vengono attivati solo con il consenso esplicito dell&apos;utente.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">3. Gestione dei cookie</h2>
            <p className="text-[#64748b]">
              Al primo accesso al sito, viene mostrato un banner per il consenso ai cookie.
              L&apos;utente può modificare le proprie preferenze in qualsiasi momento attraverso
              le impostazioni del browser.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">4. Contatti</h2>
            <p className="text-[#64748b]">
              Per informazioni sulla gestione dei cookie: privacy@privatio.it
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
