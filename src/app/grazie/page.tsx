import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GraziePage() {
  return (
    <>
      <Header />
      <main className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

        <div className="relative max-w-lg mx-auto text-center px-4 py-16">
          <div className="w-20 h-20 bg-[#C9A84C]/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-[-0.02em] text-white mb-4">Grazie!</h1>
          <p className="text-lg text-white/60 mb-4">
            Il tuo immobile è stato inserito con successo.
          </p>
          <p className="text-white/40 mb-8">
            Il nostro team verificherà il tuo annuncio e ti metterà in contatto
            con un&apos;agenzia partner nella tua zona. Riceverai una email di conferma a breve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/venditore"
              className="px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
            >
              Vai alla Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 border border-white/15 text-white/60 rounded-xl font-medium hover:bg-white/5 hover:text-white/80 transition-all duration-300"
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
