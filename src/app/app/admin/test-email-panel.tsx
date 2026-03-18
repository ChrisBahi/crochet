"use client";

import { useState } from "react";

type EmailRow = {
  type: string;
  label: string;
  from: string;
  subject: string;
  tag: string;
};

const EMAIL_ROWS: EmailRow[] = [
  // Approve
  { type: "approve-cedant",     label: "Approuvé — cédant",     from: "contact@", subject: "Votre dossier CROCHET est ouvert",         tag: "onboarding" },
  { type: "approve-repreneur",  label: "Approuvé — repreneur",  from: "contact@", subject: "Votre accès CROCHET est activé",            tag: "onboarding" },
  { type: "approve-fonds",      label: "Approuvé — fonds",      from: "contact@", subject: "Votre pipeline CROCHET est activé",         tag: "onboarding" },
  { type: "reject",             label: "Rejeté",                from: "contact@", subject: "Votre candidature CROCHET",                 tag: "onboarding" },
  // Drip J+1
  { type: "drip-j1-cedant",    label: "Drip J+1 — cédant",    from: "support@", subject: "Votre dossier CROCHET vous attend",         tag: "drip" },
  { type: "drip-j1-repreneur", label: "Drip J+1 — repreneur", from: "support@", subject: "Configurez vos critères — c'est 2 minutes", tag: "drip" },
  { type: "drip-j1-fonds",     label: "Drip J+1 — fonds",     from: "support@", subject: "Votre pipeline M&A PME est actif",          tag: "drip" },
  // Drip J+3
  { type: "drip-j3-cedant",    label: "Drip J+3 — cédant",    from: "support@", subject: "Votre dossier n'est pas encore soumis",     tag: "drip" },
  { type: "drip-j3-repreneur", label: "Drip J+3 — repreneur", from: "support@", subject: "Vos critères ne sont pas encore renseignés", tag: "drip" },
  { type: "drip-j3-fonds",     label: "Drip J+3 — fonds",     from: "support@", subject: "Votre profil investisseur est incomplet",    tag: "drip" },
  // Drip J+7
  { type: "drip-j7-cedant",    label: "Drip J+7 — cédant",    from: "support@", subject: "Votre essai CROCHET — 7 jours déjà",       tag: "drip" },
  { type: "drip-j7-repreneur", label: "Drip J+7 — repreneur", from: "support@", subject: "Des dossiers de cession vous attendent",    tag: "drip" },
  { type: "drip-j7-fonds",     label: "Drip J+7 — fonds",     from: "support@", subject: "Votre pipeline CROCHET — bilan J+7",        tag: "drip" },
  // Transactional
  { type: "weekly-digest",     label: "Weekly digest",         from: "support@", subject: "X nouveaux matches cette semaine",         tag: "transac" },
  { type: "dossier-dscore",    label: "Dossier qualifié",      from: "support@", subject: "Dossier qualifié — D-Score 78",            tag: "transac" },
  { type: "new-match",         label: "Nouveau match",         from: "support@", subject: "Nouveau match disponible — M-Score 77",    tag: "transac" },
];

const TAG_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  drip: "Drip",
  transac: "Transactionnel",
};

const TAG_COLORS: Record<string, string> = {
  onboarding: "#1E40AF",
  drip: "#7C3AED",
  transac: "#2D6A4F",
};

export function TestEmailPanel() {
  const [to, setTo] = useState("chrism@concluons.com");
  const [statuses, setStatuses] = useState<Record<string, "idle" | "loading" | "ok" | "err">>({});

  async function sendOne(type: string) {
    setStatuses((s) => ({ ...s, [type]: "loading" }));
    try {
      const res = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, to }),
      });
      setStatuses((s) => ({ ...s, [type]: res.ok ? "ok" : "err" }));
    } catch {
      setStatuses((s) => ({ ...s, [type]: "err" }));
    }
  }

  async function sendAll() {
    for (const row of EMAIL_ROWS) {
      await sendOne(row.type);
      await new Promise((r) => setTimeout(r, 400)); // 400ms between sends
    }
  }

  function StatusIcon({ type }: { type: string }) {
    const s = statuses[type] ?? "idle";
    if (s === "loading") return <span style={{ color: "#7A746E", fontSize: 12 }}>⏳</span>;
    if (s === "ok") return <span style={{ color: "#2D6A4F", fontSize: 12 }}>✓</span>;
    if (s === "err") return <span style={{ color: "#C0392B", fontSize: 12 }}>✗</span>;
    return null;
  }

  const groups = ["onboarding", "drip", "transac"] as const;

  return (
    <div style={{ padding: "20px 24px", border: "1px solid #E0DAD0", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>
            Test emails
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#7A746E" }}>
            Envoie une copie de chaque template à l'adresse ci-dessous.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinataire@email.com"
            style={{
              padding: "8px 12px",
              border: "1px solid #E0DAD0",
              background: "#FDFAF6",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#0A0A0A",
              outline: "none",
              width: 220,
            }}
          />
          <button
            onClick={sendAll}
            style={{
              padding: "8px 16px",
              background: "#0A0A0A",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Tout envoyer
          </button>
        </div>
      </div>

      {groups.map((tag) => (
        <div key={tag} style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: TAG_COLORS[tag],
            marginBottom: 8,
          }}>
            {TAG_LABELS[tag]}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {EMAIL_ROWS.filter((r) => r.tag === tag).map((row) => (
              <div
                key={row.type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#FDFAF6",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 600, color: "#0A0A0A" }}>
                    {row.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#7A746E", marginTop: 2 }}>
                    {row.from} · {row.subject}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <StatusIcon type={row.type} />
                  <button
                    onClick={() => sendOne(row.type)}
                    disabled={statuses[row.type] === "loading"}
                    style={{
                      padding: "5px 12px",
                      border: "1px solid #E0DAD0",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#0A0A0A",
                    }}
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
