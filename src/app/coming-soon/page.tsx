import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privatio — Presto Online",
  description:
    "Il marketplace immobiliare italiano a zero commissioni per il venditore. Presto online.",
};

export default function ComingSoonPage() {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "600px" }}>
          {/* Logo */}
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "#3b82f6" }}>Privat</span>
            <span style={{ color: "#f8fafc" }}>io</span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "1.25rem",
              color: "#94a3b8",
              marginBottom: "3rem",
              lineHeight: 1.6,
            }}
          >
            Il marketplace immobiliare italiano
            <br />a <strong style={{ color: "#3b82f6" }}>zero commissioni</strong>{" "}
            per il venditore.
          </p>

          {/* Divider */}
          <div
            style={{
              width: "60px",
              height: "3px",
              background: "#3b82f6",
              margin: "0 auto 3rem",
              borderRadius: "2px",
            }}
          />

          {/* Coming soon */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#e2e8f0",
            }}
          >
            Presto online
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "#64748b",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            Stiamo preparando qualcosa di nuovo per il mercato immobiliare
            italiano. Vendi casa senza commissioni, con il supporto di agenzie
            certificate.
          </p>

          {/* Contact */}
          <a
            href="mailto:info@privatio.it"
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              transition: "background 0.2s",
            }}
          >
            Contattaci
          </a>

          <p
            style={{
              marginTop: "3rem",
              fontSize: "0.85rem",
              color: "#475569",
            }}
          >
            info@privatio.it
          </p>
        </div>
      </body>
    </html>
  );
}
