"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/lang/context";

// ── Types ────────────────────────────────────────────────────────────────────

type Tunnel = "cedant" | "repreneur" | "fonds";

interface QualAnswers {
  tunnel: Tunnel | null;
  intent_size: string;
  intent_horizon: string;
}

// ── Traductions ───────────────────────────────────────────────────────────────

const tx = {
  fr: {
    headerLink: "Se connecter",
    // Qualification
    qual: {
      step: (n: number, total: number) => `Question ${n} sur ${total}`,
      back: "← Retour",
      q1: {
        label: "Première question",
        question: "Vous souhaitez…",
        options: [
          { value: "cedant",    label: "Vendre mon entreprise",       sub: "Cession, transmission, départ à la retraite" },
          { value: "repreneur", label: "Acquérir une entreprise",     sub: "Rachat, croissance externe, reprise" },
          { value: "fonds",     label: "Investir dans des entreprises", sub: "Fonds, family office, investisseur privé" },
        ],
      },
      q2: {
        label: "Deuxième question",
        question: "Taille d'entreprise visée",
        options: [
          { value: "< 500k€",    label: "< 500k€",   sub: "Petite entreprise" },
          { value: "500k – 5M€", label: "500k – 5M€", sub: "PME" },
          { value: "5M – 20M€",  label: "5M – 20M€",  sub: "ETI" },
          { value: "> 20M€",     label: "> 20M€",     sub: "Grande entreprise" },
        ],
      },
      q3: {
        label: "Troisième question",
        question: "Horizon de temps",
        options: [
          { value: "< 6 mois",    label: "< 6 mois",    sub: "Projet imminent" },
          { value: "6 – 18 mois", label: "6 – 18 mois", sub: "Projet en cours" },
          { value: "> 18 mois",   label: "> 18 mois",   sub: "Projet à terme" },
          { value: "Je découvre", label: "Je découvre",  sub: "Pas d'horizon défini" },
        ],
      },
    },
    // Formulaire
    admissionLabel: "Admission sélective",
    title: "Accès au réseau privé.",
    subtitle: "Chaque profil est vérifié avant admission.",
    fields: {
      name: "Nom complet", email: "Email professionnel", linkedin: "LinkedIn / site",
      city: "Ville / pays", role: "Rôle", siret: "Siren", ticket: "Ticket moyen",
      context: "Contexte", contextOpt: "(optionnel)",
    },
    placeholders: {
      linkedin: "https://",
      siret: "123 456 789", ticket: "ex. 500K€ – 2M€",
      context: "Décrivez votre activité, vos cibles ou ce que vous cherchez à accomplir sur la plateforme.",
    },
    rolePlaceholders: {
      cedant:    "ex. Dirigeant, Actionnaire majoritaire, Gérant…",
      repreneur: "ex. Repreneur indépendant, Directeur M&A, DG…",
      fonds:     "ex. Partner, Family Office, Directeur d'investissements…",
    },
    sirenHint: "Requis pour les professionnels. Permet la vérification de votre structure.",
    submitLoading: "Envoi…",
    submit: "Soumettre ma candidature",
    privacy: "Vos informations sont confidentielles et utilisées uniquement dans le cadre du processus d'admission. Aucune diffusion commerciale.",
    errorPrefix: "Erreur lors de l'envoi : ",
    successLabel: "Demande reçue",
    successTitle: "Votre dossier est en cours d'examen.",
    successDesc: "Chaque admission est traitée individuellement. Vous recevrez une réponse sous 48h.",
    tunnelLabels: {
      cedant:    "Cédant",
      repreneur: "Repreneur",
      fonds:     "Investisseur",
    },
  },
};

// ── Styles partagés ───────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E0DAD0",
  borderRadius: 0,
  padding: "14px 16px",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
  fontSize: 14,
  color: "#0A0A0A",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
  fontSize: 13,
  color: "#0A0A0A",
  marginBottom: 8,
};

// ── Composants ────────────────────────────────────────────────────────────────

function Field({
  label, name, type = "text", placeholder, value, onChange, hint,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <input
        id={name} name={name} type={type} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
      {hint && (
        <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#7A746E", marginTop: 6 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Écran de qualification ────────────────────────────────────────────────────

function QualScreen({
  step, qual, onAnswer, onBack,
}: {
  step: 1 | 2 | 3;
  qual: QualAnswers;
  onAnswer: (value: string) => void;
  onBack: () => void;
}) {
  const t = tx.fr.qual;
  const q = step === 1 ? t.q1 : step === 2 ? t.q2 : t.q3;
  const currentValue = step === 1 ? qual.tunnel : step === 2 ? qual.intent_size : qual.intent_horizon;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: "clamp(24px, 5vw, 72px)",
        borderBottom: "1px solid #1A1A1A",
        flexShrink: 0,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 18, fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            CROCHETT.
          </span>
        </Link>
        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              width: n === step ? 20 : 6,
              height: 6,
              background: n === step ? "#FFFFFF" : n < step ? "#555" : "#2A2A2A",
              borderRadius: 3,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </header>

      {/* Corps */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px clamp(24px, 5vw, 72px)",
        maxWidth: 960,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {/* Label étape */}
        <div style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#555", marginBottom: 24,
        }}>
          {t.step(step, 3)}
        </div>

        {/* Question */}
        <h2 style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 700, color: "#FFFFFF",
          margin: "0 0 48px", lineHeight: 1.1,
        }}>
          {q.question}
        </h2>

        {/* Options */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${q.options.length <= 3 ? q.options.length : 2}, 1fr)`,
          gap: 12,
        }}>
          {q.options.map((opt) => {
            const selected = currentValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onAnswer(opt.value)}
                style={{
                  background: selected ? "#FFFFFF" : "#111111",
                  border: `1px solid ${selected ? "#FFFFFF" : "#2A2A2A"}`,
                  padding: "28px 24px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: 18, fontWeight: 700,
                  color: selected ? "#0A0A0A" : "#FFFFFF",
                  marginBottom: 8, lineHeight: 1.2,
                }}>
                  {opt.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12, color: selected ? "#555" : "#666", lineHeight: 1.5,
                }}>
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Retour */}
        {step > 1 && (
          <button
            onClick={onBack}
            style={{
              marginTop: 40,
              background: "none",
              border: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12, color: "#555",
              cursor: "pointer", letterSpacing: "0.06em",
              textAlign: "left", padding: 0,
            }}
          >
            {t.back}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Formulaire principal ──────────────────────────────────────────────────────

function RegisterForm() {
  const lang = "fr";
  const t = tx[lang];
  const searchParams = useSearchParams();
  const refSource = searchParams.get("ref") || null;
  const roleParam = searchParams.get("role") || "";

  // Step : 'qual1' | 'qual2' | 'qual3' | 'form'
  const [step, setStep] = useState<"qual1" | "qual2" | "qual3" | "form">(
    roleParam ? "form" : "qual1"
  );

  const [qual, setQual] = useState<QualAnswers>({
    tunnel: null,
    intent_size: "",
    intent_horizon: "",
  });

  const [form, setForm] = useState({
    name: "", email: "", linkedin: "", city: "",
    role: roleParam, siret: "", ticket: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam) setForm((f) => ({ ...f, role: roleParam }));
  }, [roleParam]);

  function setField(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  // Gestion des réponses qualification
  function handleQ1(value: string) {
    setQual((q) => ({ ...q, tunnel: value as Tunnel }));
    setStep("qual2");
  }
  function handleQ2(value: string) {
    setQual((q) => ({ ...q, intent_size: value }));
    setStep("qual3");
  }
  function handleQ3(value: string) {
    setQual((q) => ({ ...q, intent_horizon: value }));
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("admission_requests").insert({
      name: form.name,
      email: form.email,
      linkedin: form.linkedin || null,
      city: form.city || null,
      role: form.role,
      siret: form.siret || null,
      ticket: form.ticket || null,
      message: form.message || null,
      source: refSource,
      tunnel: qual.tunnel,
      intent_size: qual.intent_size || null,
      intent_horizon: qual.intent_horizon || null,
    });
    setLoading(false);
    if (error) {
      alert(t.errorPrefix + error.message);
      return;
    }
    setSubmitted(true);
  }

  // ── Écrans de qualification ──────────────────────────────────────────────

  if (step === "qual1") {
    return (
      <QualScreen
        step={1} qual={qual}
        onAnswer={handleQ1}
        onBack={() => {}}
      />
    );
  }
  if (step === "qual2") {
    return (
      <QualScreen
        step={2} qual={qual}
        onAnswer={handleQ2}
        onBack={() => setStep("qual1")}
      />
    );
  }
  if (step === "qual3") {
    return (
      <QualScreen
        step={3} qual={qual}
        onAnswer={handleQ3}
        onBack={() => setStep("qual2")}
      />
    );
  }

  // ── Écran succès ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F2EE",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#7A746E", marginBottom: 20,
          }}>
            {t.successLabel}
          </div>
          <h2 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 36, fontWeight: 700, color: "#0A0A0A",
            margin: "0 0 16px", lineHeight: 1.15,
          }}>
            {t.successTitle}
          </h2>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14, color: "#7A746E", lineHeight: 1.7,
          }}>
            {t.successDesc}
          </p>
        </div>
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────────────────

  const tunnelLabel = qual.tunnel ? t.tunnelLabels[qual.tunnel] : null;
  const rolePlaceholder = qual.tunnel
    ? t.rolePlaceholders[qual.tunnel]
    : t.placeholders.linkedin;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE" }}>

      <header style={{
        background: "#0A0A0A",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, paddingInline: 48,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20, fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
          }}>
            CROCHETT.
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {tunnelLabel && !roleParam && (
            <button
              onClick={() => setStep("qual1")}
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#AAA", background: "#1A1A1A",
                border: "1px solid #333", padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              {tunnelLabel} · Modifier
            </button>
          )}
          <a href="/login" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 400, letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            color: "#7A746E", textDecoration: "none",
          }}>
            {t.headerLink}
          </a>
        </div>
      </header>

      <div style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          <div style={{ marginBottom: 52 }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "#7A746E", marginBottom: 16,
            }}>
              {t.admissionLabel}
            </div>
            <h1 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: 52, fontWeight: 700, color: "#0A0A0A",
              margin: "0 0 16px", lineHeight: 1.1,
            }}>
              {t.title}
            </h1>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 16, color: "#7A746E", margin: 0,
            }}>
              {t.subtitle}
            </p>
          </div>

          <div style={{
            background: "#FFFFFF", border: "1px solid #E0DAD0",
            padding: "48px 52px", maxWidth: 760,
          }}>
            <form onSubmit={handleSubmit}>

              <Field label={t.fields.name} name="name" value={form.name} onChange={setField("name")} />
              <Field label={t.fields.email} name="email" type="email" value={form.email} onChange={setField("email")} />
              <Field label={t.fields.linkedin} name="linkedin" value={form.linkedin} onChange={setField("linkedin")} placeholder="https://" />
              <Field label={t.fields.city} name="city" value={form.city} onChange={setField("city")} />
              <Field
                label={t.fields.role} name="role"
                value={form.role} onChange={setField("role")}
                placeholder={rolePlaceholder}
              />

              <div style={{ borderTop: "1px solid #E0DAD0", margin: "8px 0 28px" }} />

              <Field
                label={t.fields.siret} name="siret"
                value={form.siret} onChange={setField("siret")}
                placeholder={t.placeholders.siret}
                hint={t.sirenHint}
              />
              <Field
                label={t.fields.ticket} name="ticket"
                value={form.ticket} onChange={setField("ticket")}
                placeholder={t.placeholders.ticket}
              />

              <div style={{ marginBottom: 36 }}>
                <label htmlFor="message" style={labelStyle}>
                  {t.fields.context} <span style={{ color: "#7A746E", fontWeight: 400 }}>{t.fields.contextOpt}</span>
                </label>
                <textarea
                  id="message" name="message" rows={4}
                  value={form.message}
                  onChange={(e) => setField("message")(e.target.value)}
                  placeholder={t.placeholders.context}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !form.name || !form.email || !form.role}
                style={{
                  background: "#0A0A0A", color: "#FFFFFF", border: "none",
                  padding: "16px 40px",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: loading ? "wait" : "pointer",
                  opacity: (!form.name || !form.email || !form.role) ? 0.4 : 1,
                }}
              >
                {loading ? t.submitLoading : t.submit}
              </button>

            </form>
          </div>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11, color: "#7A746E",
            marginTop: 28, maxWidth: 560, lineHeight: 1.7,
          }}>
            {t.privacy}
          </p>

        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
