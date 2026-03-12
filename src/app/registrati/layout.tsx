import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrati",
  description:
    "Crea un account gratuito su Privatio. Vendi casa senza commissioni o trova il tuo prossimo immobile tra le nostre proposte.",
};

export default function RegistratiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
