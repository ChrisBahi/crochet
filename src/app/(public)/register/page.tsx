"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/lang/context";

const translations = {
  fr: {
    headerLink: "Se connecter",
    admissionLabel: "Admission sélective",
    title: "Accès au réseau privé.",
    subtitle: "Chaque profil est vérifié avant admission.",
    fields: {
      name: "Nom complet", email: "Email professionnel", linkedin: "LinkedIn / site",
      city: "Ville / pays", role: "Rôle", siret: "Siren", ticket: "Ticket moyen",
      context: "Contexte", contextOpt: "(optionnel)",
    },
    placeholders: {
      linkedin: "https://", role: "ex. Partner, Directeur M&A, Family Office…",
      siret: "123 456 789", ticket: "ex. 500K€ – 2M€",
      context: "Décrivez votre activité, vos cibles ou ce que vous cherchez à accomplir sur la plateforme.",
    },
    sirenHint: "Requis pour les professionnels. Permet la vérification de votre structure.",
    submitLoading: "Envoi…",
    submit: "Soumettre ma candidature",
    privacy: "Vos informations sont confidentielles et utilisées uniquement dans le cadre du processus d'admission. Aucune diffusion commerciale.",
    errorPrefix: "Erreur lors de l'envoi : ",
    successLabel: "Demande reçue",
    successTitle: "Votre dossier est en cours d'examen.",
    successDesc: "Chaque admission est traitée individuellement. Vous recevrez une réponse sous 48h.",
  },
  en: {
    headerLink: "Sign in",
    admissionLabel: "Selective admission",
    title: "Access to the private network.",
    subtitle: "Every profile is verified before admission.",
    fields: {
      name: "Full name", email: "Professional email", linkedin: "LinkedIn / website",
      city: "City / country", role: "Role", siret: "Company number", ticket: "Average ticket",
      context: "Context", contextOpt: "(optional)",
    },
    placeholders: {
      linkedin: "https://", role: "e.g. Partner, M&A Director, Family Office…",
      siret: "123 456 789", ticket: "e.g. €500K – €2M",
      context: "Describe your activity, targets, or what you aim to achieve on the platform.",
    },
    sirenHint: "Required for professionals. Allows verification of your entity.",
    submitLoading: "Sending…",
    submit: "Submit my application",
    privacy: "Your information is confidential and used solely for the admission process. No commercial distribution.",
    errorPrefix: "Submission error: ",
    successLabel: "Request received",
    successTitle: "Your application is under review.",
    successDesc: "Each admission is handled individually. You will receive a response within 48h.",
  },
};

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

function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
      {hint && (
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
          marginTop: 6,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { lang } = useLang();
  const tx = translations[lang];
  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedin: "",
    city: "",
    role: "",
    siret: "",
    ticket: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
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
    });
    setLoading(false);
    if (error) {
      alert(tx.errorPrefix + error.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F5F2EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 20,
          }}>
            {tx.successLabel}
          </div>
          <h2 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#0A0A0A",
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}>
            {tx.successTitle}
          </h2>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#7A746E",
            lineHeight: 1.7,
          }}>
            {tx.successDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE" }}>

      {/* Header */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            fontStyle: "normal",
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}>
            CROCHET.
          </span>
        </Link>
        <a href="/login" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: "#7A746E",
          textDecoration: "none",
        }}>
          {tx.headerLink}
        </a>
      </header>

    <div style={{
      padding: "64px 24px",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 16,
          }}>
            {tx.admissionLabel}
          </div>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 52,
            fontWeight: 700,
            color: "#0A0A0A",
            margin: "0 0 16px",
            lineHeight: 1.1,
          }}>
            {tx.title}
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 16,
            color: "#7A746E",
            margin: 0,
          }}>
            {tx.subtitle}
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E0DAD0",
          padding: "48px 52px",
          maxWidth: 760,
        }}>
          <form onSubmit={handleSubmit}>

            <Field label={tx.fields.name} name="name" value={form.name} onChange={set("name")} />
            <Field label={tx.fields.email} name="email" type="email" value={form.email} onChange={set("email")} />
            <Field label={tx.fields.linkedin} name="linkedin" value={form.linkedin} onChange={set("linkedin")} placeholder={tx.placeholders.linkedin} />
            <Field label={tx.fields.city} name="city" value={form.city} onChange={set("city")} />
            <Field label={tx.fields.role} name="role" value={form.role} onChange={set("role")} placeholder={tx.placeholders.role} />

            {/* Divider */}
            <div style={{ borderTop: "1px solid #E0DAD0", margin: "8px 0 28px" }} />

            <Field
              label={tx.fields.siret}
              name="siret"
              value={form.siret}
              onChange={set("siret")}
              placeholder={tx.placeholders.siret}
              hint={tx.sirenHint}
            />
            <Field
              label={tx.fields.ticket}
              name="ticket"
              value={form.ticket}
              onChange={set("ticket")}
              placeholder={tx.placeholders.ticket}
            />

            <div style={{ marginBottom: 36 }}>
              <label htmlFor="message" style={labelStyle}>
                {tx.fields.context} <span style={{ color: "#7A746E", fontWeight: 400 }}>{tx.fields.contextOpt}</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                placeholder={tx.placeholders.context}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 100,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.name || !form.email || !form.role}
              style={{
                background: "#0A0A0A",
                color: "#FFFFFF",
                border: "none",
                padding: "16px 40px",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer",
                opacity: (!form.name || !form.email || !form.role) ? 0.4 : 1,
              }}
            >
              {loading ? tx.submitLoading : tx.submit}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
          marginTop: 28,
          maxWidth: 560,
          lineHeight: 1.7,
        }}>
          {tx.privacy}
        </p>

      </div>
    </div>
    </div>
  );
}
