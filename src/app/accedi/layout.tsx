import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accedi",
  description:
    "Accedi al tuo account Privatio per gestire i tuoi immobili, monitorare le richieste e comunicare con le agenzie partner.",
};

export default function AccediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
