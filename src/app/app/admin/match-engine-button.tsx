"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MatchResult = {
  opportunities_scanned: number;
  matches_created: number;
  skipped: {
    not_complementary: number;
    low_structured_score: number;
    low_mscore: number;
    duplicates: number;
  };
};

export function MatchEngineButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      // Get session JWT to authenticate the API call directly
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/match/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setResult({ success: false, message: `Erreur ${res.status}: ${text || "Réponse inattendue du serveur"}` });
        return;
      }

      const data: MatchResult = await res.json();
      const parts = [`${data.matches_created ?? 0} match(s) créé(s) sur ${data.opportunities_scanned ?? 0} opportunités.`];
      if (data.skipped) {
        const s = data.skipped;
        const details = [
          s.duplicates > 0 && `${s.duplicates} doublons`,
          s.not_complementary > 0 && `${s.not_complementary} non complémentaires`,
          s.low_structured_score > 0 && `${s.low_structured_score} score structuré faible`,
          s.low_mscore > 0 && `${s.low_mscore} M-Score insuffisant`,
        ].filter(Boolean);
        if (details.length) parts.push(`Ignorés : ${details.join(", ")}.`);
      }
      setResult({ success: true, message: parts.join(" ") });
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
