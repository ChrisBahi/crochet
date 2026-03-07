"use client";

import { useState } from "react";

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
    // TODO: wire to Supabase admission_requests table
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
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
            Demande reçue
          </div>
          <h2 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#0A0A0A",
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}>
            Votre dossier est en cours d&apos;examen.
          </h2>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#7A746E",
            lineHeight: 1.7,
          }}>
            Chaque admission est traitée individuellement. Vous recevrez une réponse sous 48h.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F2EE",
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
            Admission sélective
          </div>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 52,
            fontWeight: 700,
            color: "#0A0A0A",
            margin: "0 0 16px",
            lineHeight: 1.1,
          }}>
            Accès au réseau privé.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 16,
            color: "#7A746E",
            margin: 0,
          }}>
            Chaque profil est vérifié avant admission.
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

            <Field label="Nom complet" name="name" value={form.name} onChange={set("name")} />
            <Field label="Email professionnel" name="email" type="email" value={form.email} onChange={set("email")} />
            <Field label="LinkedIn / site" name="linkedin" value={form.linkedin} onChange={set("linkedin")} placeholder="https://" />
            <Field label="Ville / pays" name="city" value={form.city} onChange={set("city")} />
            <Field label="Rôle" name="role" value={form.role} onChange={set("role")} placeholder="ex. Partner, Directeur M&A, Family Office…" />

            {/* Divider */}
            <div style={{ borderTop: "1px solid #E0DAD0", margin: "8px 0 28px" }} />

            <Field
              label="SIRET"
              name="siret"
              value={form.siret}
              onChange={set("siret")}
              placeholder="123 456 789 00012"
              hint="Requis pour les professionnels. Permet la vérification de votre structure."
            />
            <Field
              label="Ticket moyen"
              name="ticket"
              value={form.ticket}
              onChange={set("ticket")}
              placeholder="ex. 500K€ – 2M€"
            />

            <div style={{ marginBottom: 36 }}>
              <label htmlFor="message" style={labelStyle}>
                Contexte <span style={{ color: "#7A746E", fontWeight: 400 }}>(optionnel)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                placeholder="Décrivez votre activité, vos cibles ou ce que vous cherchez à accomplir sur la plateforme."
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
              {loading ? "Envoi…" : "Soumettre ma candidature"}
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
          Vos informations sont confidentielles et utilisées uniquement dans le cadre du processus d&apos;admission. Aucune diffusion commerciale.
        </p>

      </div>
    </div>
  );
}
