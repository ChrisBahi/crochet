"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MatchResult = {
  reset?: boolean;
  opportunities_scanned: number;
  matches_created: number;
  skipped: {
    not_complementary: number;
    low_structured_score: number;
    low_mscore: number;
    duplicates: number;
  };
  ai?: {
    errors: number;
    fallbacks: number;
    error_details?: { pair: string; error: string }[];
  };
};

async function runEngine(reset: boolean): Promise<MatchResult> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  const baseUrl = window.location.origin;
  const url = reset
    ? `${baseUrl}/api/match/run?reset=true`
    : `${baseUrl}/api/match/run`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur ${res.status}: ${text || "Réponse inattendue du serveur"}`);
  }
  return res.json();
}

function buildMessage(data: MatchResult): string {
  let msg = `${data.matches_created ?? 0} match(s) créé(s) sur ${data.opportunities_scanned ?? 0} opportunités analysées.`;
  if (data.ai?.errors) {
    msg += ` ⚠ ${data.ai.errors} appel(s) IA en erreur — fallback scoring utilisé.`;
  }
  if (data.reset) {
    msg = `[Reset complet] ${msg}`;
  }
  return msg;
}

export function MatchEngineButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function handleRun(reset: boolean) {
    setLoading(true);
    setResult(null);
    setConfirmReset(false);
    try {
      const data = await runEngine(reset);
      setResult({ success: true, message: buildMessage(data) });
    } catch (e: unknown) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Primary — run engine (new matches only) */}
        <button
          onClick={() => handleRun(false)}
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
            textTransform: "uppercase" as const,
          }}
        >
          {loading ? "Calcul en cours…" : "Run Match Engine"}
        </button>

        {/* Secondary — reset + rerun (destructive, needs confirmation) */}
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: loading ? "#E0DAD0" : "#C0392B",
              border: `1px solid ${loading ? "#E0DAD0" : "#C0392B"}`,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            Recalculer depuis zéro
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              color: "#C0392B",
            }}>
              Supprimer tous les matches et recalculer ?
            </span>
            <button
              onClick={() => handleRun(true)}
              style={{
                padding: "8px 16px",
                background: "#C0392B",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              Confirmer
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "#7A746E",
                border: "1px solid #E0DAD0",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

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
