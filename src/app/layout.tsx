import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
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
  twitter: {
    card: "summary_large_image",
    title: "Privatio — Vendi casa. Zero commissioni.",
    description:
      "La prima piattaforma immobiliare italiana dove il venditore non paga commissioni.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
