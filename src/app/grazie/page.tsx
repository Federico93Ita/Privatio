import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GraziePage() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center bg-bg-soft">
        <div className="max-w-lg mx-auto text-center px-4 py-16">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light tracking-[-0.03em] sm:text-4xl text-primary-dark mb-4">Grazie!</h1>
          <p className="text-lg text-text-muted mb-4">
            Il tuo immobile è stato inserito con successo.
          </p>
          <p className="text-text-muted mb-8">
            Il nostro team verificherà il tuo annuncio e ti assegnerà un&apos;agenzia
            partner nella tua zona. Riceverai una email di conferma a breve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/venditore"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors"
            >
              Vai alla Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-border text-text-muted rounded-lg font-medium hover:bg-white transition-colors"
            >
              Torna alla Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
