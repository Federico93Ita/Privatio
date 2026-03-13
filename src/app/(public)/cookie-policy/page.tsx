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
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-8">Cookie Policy</h1>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none">
            <p className="text-sm text-text-muted">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-medium text-text mt-6">1. Cosa sono i cookie</h2>
            <p className="text-text-muted">
              I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell&apos;utente
              durante la navigazione sul sito web.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">2. Cookie utilizzati</h2>

            <h3 className="text-base font-medium text-primary-dark mt-4">Cookie tecnici (necessari)</h3>
            <p className="text-text-muted">
              Essenziali per il funzionamento del sito: sessione utente, preferenze, sicurezza.
              Non richiedono consenso.
            </p>

            <h3 className="text-base font-medium text-primary-dark mt-4">Cookie analitici</h3>
            <p className="text-text-muted">
              Utilizziamo Google Analytics 4 per analizzare il traffico del sito in forma aggregata.
              I dati sono anonimizzati e utilizzati solo per migliorare il servizio.
            </p>

            <h3 className="text-base font-medium text-primary-dark mt-4">Cookie di terze parti</h3>
            <p className="text-text-muted">
              Al momento non utilizziamo cookie di marketing o profilazione di terze parti.
              In futuro, eventuali cookie di terze parti verranno attivati solo con il consenso esplicito dell&apos;utente
              e questa policy verrà aggiornata di conseguenza.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">3. Gestione dei cookie</h2>
            <p className="text-text-muted">
              Al primo accesso al sito, viene mostrato un banner per il consenso ai cookie.
              L&apos;utente può modificare le proprie preferenze in qualsiasi momento cliccando
              su &quot;Gestisci cookie&quot; nel footer del sito, oppure attraverso le impostazioni del browser.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">4. Contatti</h2>
            <p className="text-text-muted">
              Per informazioni sulla gestione dei cookie: privacy@privatio.it
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
