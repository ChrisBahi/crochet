"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/app");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

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
        margin: "0 0 0",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease forwards",
      }}>
        Le signal,
      </h1>
      <h1 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: "clamp(48px, 7vw, 96px)",
        fontWeight: 800,
        color: "#FFFFFF",
        margin: "0 0 0",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        textAlign: "center",
        animation: "fadeIn 0.8s ease 0.2s both",
      }}>
        pas le bruit.
      </h1>

      <div style={{
        marginTop: 56,
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 9,
        color: "#333",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        animation: "fadeIn 0.8s ease 0.8s both",
      }}>
        CROCHET.
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
