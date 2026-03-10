import Link from "next/link";

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
      { href: "/termini-di-servizio", label: "Termini di Servizio" },
    ],
  },
];

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
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
      width="20"
      height="20"
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
    <footer className="border-t border-border bg-bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="footer-logo-gradient"
                    x1="0"
                    y1="0"
                    x2="36"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#0e8ff1" />
                    <stop offset="1" stopColor="#0a1f44" />
                  </linearGradient>
                </defs>
                <rect
                  rx="8"
                  width="36"
                  height="36"
                  fill="url(#footer-logo-gradient)"
                />
                <text
                  x="50%"
                  y="53%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="700"
                  fontSize="22"
                >
                  P
                </text>
              </svg>
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#0a1f44",
                }}
              >
                Privatio
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              La prima piattaforma pensata per chi vende
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-dark">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contatti Section - displayed under columns on larger screens */}
        <div className="mt-10 border-t border-border pt-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-dark">
                Contatti
              </h3>
              <a
                href="mailto:info@privatio.it"
                className="mt-2 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
              >
                <MailIcon />
                info@privatio.it
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/privatio.it"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-muted shadow-sm transition-colors hover:bg-primary hover:text-white"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com/company/privatio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-muted shadow-sm transition-colors hover:bg-primary hover:text-white"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-white/70">
            &copy; {new Date().getFullYear()} Privatio S.r.l. &mdash; P.IVA 12345678901
          </p>
        </div>
      </div>
    </footer>
  );
}
