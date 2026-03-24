import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ComplaintForm from "./ComplaintForm";

export const metadata = {
  title: "Reclami — Sistema interno di gestione reclami",
  description:
    "Presenta un reclamo ai sensi del Regolamento P2B (UE) 2019/1150, Art. 11. Privatio garantisce trasparenza, tempi certi e mediazione obbligatoria.",
};

export default function ReclamiPage() {
  return (
    <>
      <Header />
      <main className="bg-bg-soft min-h-screen">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-light tracking-[-0.03em] sm:text-4xl text-primary-dark mb-4">
                Sistema di gestione reclami
              </h1>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Ai sensi dell&apos;Art. 11 del Regolamento (UE) 2019/1150 (P2B), Privatio mette a
                disposizione un sistema interno di gestione dei reclami accessibile, gratuito e trasparente.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Info column */}
              <div className="space-y-6">
                {/* Procedure explanation */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-medium text-primary-dark mb-4">Procedura di reclamo</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-4">
                    Ogni utente commerciale della piattaforma (venditori, agenzie convenzionate e acquirenti) ha il
                    diritto di presentare un reclamo in merito a:
                  </p>
                  <ul className="text-text-muted text-sm space-y-2 list-disc list-inside">
                    <li>Presunta non conformità del servizio ai termini contrattuali</li>
                    <li>Decisioni di sospensione, limitazione o rimozione dall&apos;account</li>
                    <li>Questioni tecniche che impattano l&apos;utilizzo della piattaforma</li>
                    <li>Trasparenza del posizionamento e dei criteri di classificazione</li>
                    <li>Trattamento differenziato o discriminatorio</li>
                  </ul>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-medium text-primary-dark mb-4">Tempistiche garantite</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-sm">1</span>
                        </div>
                        <div className="w-px h-full bg-border mt-2" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-text text-sm">Conferma di ricezione</p>
                        <p className="text-text-muted text-sm">Entro <strong>48 ore lavorative</strong> dalla presentazione del reclamo</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-sm">2</span>
                        </div>
                        <div className="w-px h-full bg-border mt-2" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-text text-sm">Istruttoria e analisi</p>
                        <p className="text-text-muted text-sm">Il reclamo viene analizzato dal nostro team dedicato con la massima attenzione</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-sm">3</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-text text-sm">Risposta definitiva</p>
                        <p className="text-text-muted text-sm">Entro <strong>30 giorni</strong> dalla ricezione del reclamo, con esito motivato</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mediation */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-medium text-primary-dark mb-4">Mediazione obbligatoria</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-3">
                    Se il reclamo non viene risolto in modo soddisfacente tramite il sistema interno,
                    l&apos;utente commerciale ha diritto di ricorrere a un organismo di mediazione certificato,
                    ai sensi dell&apos;Art. 12 del Regolamento P2B.
                  </p>
                  <p className="text-text-muted text-sm leading-relaxed mb-3">
                    Privatio si impegna a partecipare in buona fede al procedimento di mediazione
                    e a sostenere una quota ragionevole dei relativi costi.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-primary-dark font-medium mb-1">Organismo di mediazione designato</p>
                    <p className="text-sm text-text-muted">
                      ADR Center — Centro per la risoluzione alternativa delle controversie<br />
                      <a href="https://www.adrcenter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        www.adrcenter.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-medium text-primary-dark mb-3">Contatti dedicati</h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Per informazioni sulla procedura o sullo stato del tuo reclamo:
                  </p>
                  <p className="text-sm mt-2">
                    <a href="mailto:reclami@privatio.it" className="text-primary font-medium hover:underline">
                      reclami@privatio.it
                    </a>
                  </p>
                </div>
              </div>

              {/* Form column */}
              <ComplaintForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
