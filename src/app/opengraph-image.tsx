import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Privatio — Vendi casa. Zero commissioni.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0B1D3A",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: "#C9A84C",
              letterSpacing: "-0.03em",
            }}
          >
            Privatio
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Vendi casa.
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#C9A84C",
              letterSpacing: "-0.02em",
            }}
          >
            Zero commissioni.
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            marginTop: 30,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          La prima piattaforma immobiliare italiana dove il venditore non paga nulla
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 60,
            marginTop: 50,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>150+</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Venditori</span>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>45</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Agenzie</span>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>0%</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Commissione</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
