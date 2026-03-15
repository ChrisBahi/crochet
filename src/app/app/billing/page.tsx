"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "290",
    description: "Pour les conseillers indépendants",
    priceEnv: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
    features: ["1 workspace", "50 dossiers/mois", "Matching IA", "1 Secure Room active"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "590",
    description: "Pour les fonds et family offices",
    priceEnv: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
    features: ["3 workspaces", "Dossiers illimités", "Matching IA prioritaire", "5 Rooms actives", "MEMOs confidentiels"],
  },
  {
    id: "scale",
    name: "Scale",
    price: "1 490",
    description: "Pour les boutiques M&A et multi-fonds",
    priceEnv: "NEXT_PUBLIC_STRIPE_PRICE_SCALE",
    features: ["Workspaces illimités", "Dossiers illimités", "Matching IA prioritaire", "Rooms illimitées", "MEMOs + NDA auto", "Support dédié"],
  },
];

const PRICE_IDS: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
  scale: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE ?? "",
};

function BillingContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  async function handleSubscribe(planId: string) {
    const priceId = PRICE_IDS[planId];
    if (!priceId) return;

    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", padding: "48px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "#7A746E",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            ABONNEMENT
          </div>
          <h1 style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 800,
            color: "#0A0A0A",
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Choisissez votre plan.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 15,
            color: "#7A746E",
            marginTop: 8,
          }}>
            14 jours d&apos;essai gratuit — sans CB requise.
          </p>
        </div>

        {/* Success / Canceled banners */}
        {success && (
          <div style={{
            background: "#F0FDF4",
            border: "1px solid #86EFAC",
            borderRadius: 4,
            padding: "12px 16px",
            marginBottom: 32,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#166534",
          }}>
            Abonnement activé. Bienvenue sur CROCHET.
          </div>
        )}
        {canceled && (
          <div style={{
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: 4,
            padding: "12px 16px",
            marginBottom: 32,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#92400E",
          }}>
            Paiement annulé. Vous pouvez réessayer à tout moment.
          </div>
        )}

        {/* Plans grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 1,
          border: "1px solid #E0DAD0",
        }}>
          {PLANS.map((plan, i) => (
            <div key={plan.id} style={{
              background: i === 1 ? "#0A0A0A" : "#FFFFFF",
              padding: "36px 32px",
              border: i !== 0 ? "none" : undefined,
              borderLeft: i > 0 ? "1px solid #E0DAD0" : undefined,
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: i === 1 ? "#7A746E" : "#7A746E",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {plan.name}
              </div>
              <div style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: 40,
                fontWeight: 800,
                color: i === 1 ? "#FFFFFF" : "#0A0A0A",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}>
                €{plan.price}
                <span style={{ fontSize: 14, fontWeight: 400, color: i === 1 ? "#7A746E" : "#7A746E" }}>/mois</span>
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13,
                color: i === 1 ? "#A8A29E" : "#7A746E",
                marginBottom: 24,
              }}>
                {plan.description}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: i === 1 ? "#E7E5E4" : "#3D3832",
                    padding: "6px 0",
                    borderBottom: `1px solid ${i === 1 ? "#1C1C1C" : "#F0EDE8"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span style={{ color: i === 1 ? "#7A746E" : "#C0B9AF", fontSize: 10 }}>—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  background: i === 1 ? "#FFFFFF" : "#0A0A0A",
                  color: i === 1 ? "#0A0A0A" : "#FFFFFF",
                  border: "none",
                  padding: "12px 24px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: loading === plan.id ? "not-allowed" : "pointer",
                  opacity: loading === plan.id ? 0.6 : 1,
                  width: "100%",
                }}
              >
                {loading === plan.id ? "..." : "Commencer l'essai →"}
              </button>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: "#A8A29E",
          marginTop: 24,
          textAlign: "center",
        }}>
          Sans engagement · Résiliation à tout moment · Hébergement EU · RGPD
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
