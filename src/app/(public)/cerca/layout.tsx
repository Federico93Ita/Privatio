import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cerca Immobili",
  description:
    "Cerca tra centinaia di immobili in vendita in tutta Italia. Appartamenti, ville, attici e loft a zero commissioni per il venditore su Privatio.",
  openGraph: {
    title: "Cerca Immobili — Privatio",
    description:
      "Trova la tua casa ideale tra gli immobili disponibili su Privatio. Zero commissioni per chi vende.",
  },
};

export default function CercaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
