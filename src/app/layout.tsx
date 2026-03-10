import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Privatio — Vendi casa. Zero commissioni.",
    template: "%s | Privatio",
  },
  description:
    "La prima piattaforma immobiliare italiana dove il venditore non paga commissioni. Vendi casa con agenzie partner locali e incassa il 100%.",
  keywords: [
    "vendere casa",
    "zero commissioni",
    "immobiliare",
    "agenzia immobiliare",
    "vendita immobili",
    "privatio",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://privatio.it",
    siteName: "Privatio",
    title: "Privatio — Vendi casa. Zero commissioni.",
    description:
      "La prima piattaforma immobiliare italiana dove il venditore non paga commissioni.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${anton.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
