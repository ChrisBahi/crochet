"use client";

import { useRouter } from "next/navigation";

export default function WelcomeCedant() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 24px",
    }}>

      {/* Tunnel badge */}
      <div style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 9,
        color: "#7A746E",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: 40,
        animation: "fadeIn 0.6s ease forwards",
      }}>
        CÉDANT — ESPACE CONFIDENTIEL
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontSize: "clamp(40px, 6vw, 80px)",
        fontWeight: 800,
        color: "#FFFFFF",
        margin: "0",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease 0.1s both",
      }}>
        Votre dossier,
      </h1>
      <h1 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: "clamp(40px, 6vw, 80px)",
        fontWeight: 800,
        color: "#FFFFFF",
        margin: "0 0 48px",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease 0.25s both",
      }}>
        votre valeur.
      </h1>

      {/* Subtitle */}
      <p style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 14,
        color: "#7A746E",
        margin: "0 0 16px",
        letterSpacing: "0.02em",
        textAlign: "center",
        maxWidth: 480,
        animation: "fadeIn 0.8s ease 0.4s both",
      }}>
        Votre accès est confirmé.
      </p>

      {/* Next step card */}
      <div style={{
        marginBottom: 40,
        padding: "24px 32px",
        border: "1px solid #1E1E1E",
        maxWidth: 480,
        width: "100%",
        animation: "fadeIn 0.8s ease 0.55s both",
      }}>
        <div style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#4A4A4A",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          PREMIÈRE ÉTAPE
        </div>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#A09890",
          margin: 0,
          lineHeight: 1.7,
        }}>
          Déposez votre dossier confidentiel. En moins de 60 secondes,
          le moteur génère votre <strong style={{ color: "#FFFFFF" }}>MÉMO</strong> et
          votre <strong style={{ color: "#FFFFFF" }}>D-Score</strong> — le seul document
          que vous partagerez avec les repreneurs. Votre identité reste
          confidentielle jusqu'au NDA signé.
        </p>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => router.push("/app/opportunities/new")}
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          background: "#FFFFFF",
          border: "none",
          padding: "16px 40px",
          cursor: "pointer",
          marginBottom: 16,
          animation: "fadeIn 0.8s ease 0.7s both",
        }}
      >
        Soumettre mon dossier →
      </button>

      {/* Secondary CTA */}
      <button
        onClick={() => router.push("/app")}
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#4A4A4A",
          background: "transparent",
          border: "none",
          padding: "8px 16px",
          cursor: "pointer",
          animation: "fadeIn 0.8s ease 0.85s both",
        }}
      >
        Explorer mon espace →
      </button>

      <div style={{
        marginTop: 64,
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 9,
        color: "#666",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        animation: "fadeIn 0.8s ease 1s both",
      }}>
        CROCHET.
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button:hover { opacity: 0.8 !important; }
      `}</style>
    </div>
  );
}
