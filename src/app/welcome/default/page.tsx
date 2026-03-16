"use client";

import { useRouter } from "next/navigation";

export default function WelcomeDefault() {
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

      <div style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 9,
        color: "#7A746E",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: 40,
        animation: "fadeIn 0.6s ease forwards",
      }}>
        ACCÈS CONFIRMÉ
      </div>

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
        Le signal,
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
        pas le bruit.
      </h1>

      <p style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 14,
        color: "#7A746E",
        margin: "0 0 40px",
        letterSpacing: "0.02em",
        animation: "fadeIn 0.8s ease 0.4s both",
      }}>
        Votre accès est confirmé.
      </p>

      <button
        onClick={() => router.replace("/app")}
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
          animation: "fadeIn 0.8s ease 0.7s both",
        }}
      >
        Accéder à mon espace →
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
