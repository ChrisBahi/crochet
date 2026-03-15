"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang/context";

export default function WelcomePage() {
  const router = useRouter();
  const { lang } = useLang();

  const line1 = lang === "en" ? "The signal," : "Le signal,";
  const line2 = lang === "en" ? "not the noise." : "pas le bruit.";
  const subtitle = lang === "en" ? "Your access is confirmed." : "Votre accès est confirmé.";
  const cta = lang === "en" ? "Enter my space →" : "Accéder à mon espace →";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <h1 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontSize: "clamp(48px, 7vw, 96px)",
        fontWeight: 800,
        color: "#FFFFFF",
        margin: "0",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease forwards",
      }}>
        {line1}
      </h1>
      <h1 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: "clamp(48px, 7vw, 96px)",
        fontWeight: 800,
        color: "#FFFFFF",
        margin: "0 0 48px",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease 0.2s both",
      }}>
        {line2}
      </h1>

      <p style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 14,
        color: "#7A746E",
        margin: "0 0 40px",
        letterSpacing: "0.02em",
        animation: "fadeIn 0.8s ease 0.5s both",
      }}>
        {subtitle}
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
          animation: "fadeIn 0.8s ease 0.8s both",
        }}
      >
        {cta}
      </button>

      <div style={{
        marginTop: 64,
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 9,
        color: "#333",
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
        button:hover {
          background: #E0DAD0 !important;
        }
      `}</style>
    </div>
  );
}
