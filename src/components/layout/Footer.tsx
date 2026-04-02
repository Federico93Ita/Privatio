"use client";

import Link from "next/link";
import { resetConsent } from "@/components/CookieBanner";
import { COMPANY } from "@/lib/company";

const footerColumns = [
  {
    title: "Piattaforma",
    links: [
      { href: "/come-funziona", label: "Come Funziona" },
      { href: "/cerca", label: "Cerca Casa" },
      { href: "/vendi", label: "Vendi Casa" },
      { href: "/per-acquirenti", label: "Per gli Acquirenti" },
    ],
  },
  {
    title: "Per le Agenzie",
    links: [
      { href: "/agenzie", label: "Diventa Partner" },
      { href: "/accedi", label: "Login Agenzia" },
    ],
  },
  {
    title: "Legale",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
      { href: "/termini-di-servizio", label: "Termini Venditore" },
      { href: "/termini-servizio-acquirente", label: "Termini Acquirente" },
      { href: "/responsabili-trattamento", label: "Responsabili Trattamento" },
      { href: "/reclami", label: "Reclami" },
    ],
  },
];

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-[#071428] overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[-5%] w-64 h-64 rounded-full bg-[#C9A84C]/[0.02] blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-semibold tracking-[-0.03em] bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] bg-clip-text text-transparent">
                Privatio
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/40">
              La prima piattaforma immobiliare italiana pensata per chi vende. Zero commissioni, massima trasparenza.
            </p>

            {/* Social icons */}
            <div className="mt-8 flex items-center gap-3">
              <a
                href="https://instagram.com/privatio.it"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/40 transition-all duration-300 hover:bg-[#C9A84C]/15 hover:text-[#C9A84C] hover:scale-105"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com/company/privatio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/40 transition-all duration-300 hover:bg-[#C9A84C]/15 hover:text-[#C9A84C] hover:scale-105"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9A84C]/50">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors duration-300 hover:text-[#C9A84C]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contatti Section */}
        <div className="mt-14 border-t border-white/[0.06] pt-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9A84C]/50">
                Contatti
              </h3>
              <a
                href="mailto:info@privatio.it"
                className="mt-3 inline-flex items-center gap-2 text-sm text-white/40 transition-colors duration-300 hover:text-[#C9A84C]"
              >
                <MailIcon />
                info@privatio.it
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            <p className="text-xs text-white/20">
              {COMPANY.footerText(new Date().getFullYear())}
            </p>
            <div className="hidden sm:block h-3 w-px bg-white/10" />
            <button
              onClick={resetConsent}
              className="text-xs text-white/15 hover:text-white/30 transition-colors duration-300"
            >
              Gestisci cookie
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
