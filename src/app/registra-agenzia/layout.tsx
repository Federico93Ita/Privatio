import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completa la Registrazione — Privatio Partner",
  description:
    "Completa la registrazione della tua agenzia immobiliare sul network Privatio Partner.",
};

export default function RegistraAgenziaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
