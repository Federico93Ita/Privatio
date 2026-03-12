import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendi Casa — Zero Commissioni",
  description:
    "Vendi il tuo immobile senza pagare commissioni. Privatio ti collega con agenzie partner locali e il ricavato è tutto tuo. Inserisci il tuo immobile gratuitamente.",
  openGraph: {
    title: "Vendi Casa Senza Commissioni — Privatio",
    description:
      "La prima piattaforma immobiliare italiana dove il venditore non paga commissioni. Inserisci il tuo immobile in pochi minuti.",
  },
};

export default function VendiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
