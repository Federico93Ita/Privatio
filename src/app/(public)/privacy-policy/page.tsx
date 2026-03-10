import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Informativa sulla privacy di Privatio ai sensi del GDPR (Regolamento UE 2016/679).",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-heading text-3xl text-[#0a1f44] mb-8">PRIVACY POLICY</h1>
          <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] prose prose-slate max-w-none">
            <p className="text-sm text-[#64748b]">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">1. Titolare del trattamento</h2>
            <p className="text-[#64748b]">
              Il Titolare del trattamento dei dati personali è Privatio S.r.l., con sede in Italia.
              Per qualsiasi richiesta relativa alla privacy, è possibile contattarci all&apos;indirizzo email: privacy@privatio.it
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">2. Dati raccolti</h2>
            <p className="text-[#64748b]">Raccogliamo i seguenti dati personali:</p>
            <ul className="text-[#64748b] list-disc pl-6 space-y-1">
              <li>Dati identificativi: nome, cognome, email, telefono</li>
              <li>Dati dell&apos;immobile: indirizzo, caratteristiche, foto, prezzo</li>
              <li>Dati di navigazione: cookie tecnici e analitici</li>
              <li>Dati di pagamento: gestiti tramite Stripe (non conserviamo dati di carte di credito)</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">3. Finalità del trattamento</h2>
            <p className="text-[#64748b]">I dati vengono trattati per:</p>
            <ul className="text-[#64748b] list-disc pl-6 space-y-1">
              <li>Gestione dell&apos;account e dei servizi richiesti</li>
              <li>Pubblicazione degli annunci immobiliari</li>
              <li>Matchmaking con agenzie partner</li>
              <li>Comunicazioni relative al servizio</li>
              <li>Adempimenti di legge</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">4. Base giuridica</h2>
            <p className="text-[#64748b]">
              Il trattamento è basato sul consenso dell&apos;interessato, sull&apos;esecuzione del contratto
              e su obblighi di legge (art. 6 GDPR).
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">5. Diritti dell&apos;interessato</h2>
            <p className="text-[#64748b]">
              Ai sensi degli articoli 15-22 del GDPR, l&apos;interessato ha diritto di accesso, rettifica,
              cancellazione, portabilità dei dati e opposizione al trattamento.
              Per esercitare i propri diritti, scrivere a: privacy@privatio.it
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">6. Conservazione dei dati</h2>
            <p className="text-[#64748b]">
              I dati vengono conservati per il tempo necessario all&apos;erogazione del servizio e comunque
              non oltre 5 anni dalla cessazione del rapporto, salvo obblighi di legge.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">7. Trasferimento dati</h2>
            <p className="text-[#64748b]">
              I dati possono essere trasferiti a fornitori terzi (Supabase, Stripe, Resend, Google, Vercel)
              che operano in conformità al GDPR o con adeguate garanzie contrattuali.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
