"use client";

import { useState } from "react";
import { runMatchEngine } from "./actions";

export function MatchEngineButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await runMatchEngine();
      setResult(res);
    } catch (e: unknown) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#E0DAD0" : "#0A0A0A",
          color: loading ? "#7A746E" : "#FFFFFF",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {loading ? "Calcul en cours…" : "Run Match Engine"}
      </button>
      {result && (
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: result.success ? "#2D6A4F" : "#C0392B",
          lineHeight: 1.5,
        }}>
          {result.message}
        </div>
      )}
    </div>
  );
}
