"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<1 | 2>(1);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setProgressStep(1);
    setLoading(true);
    setProgressStep(2);
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
      setErrorMsg("Erreur lors de l'envoi. Vérifie les champs puis réessaie.");
      setProgressStep(1);
      return;
    }
    router.push("/register/status?submitted=1");
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
          Se connecter
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
              label="Siren"
              name="siret"
              value={form.siret}
              onChange={set("siret")}
              placeholder="123 456 789"
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
            <div style={{ marginTop: 14 }}>
              <div style={{
                height: 4,
                width: 280,
                maxWidth: "100%",
                background: "#ECE6DD",
              }}>
                <div style={{
                  height: "100%",
                  width: loading ? (progressStep === 1 ? "40%" : "85%") : "0%",
                  background: "#0A0A0A",
                  transition: "width 220ms ease",
                }} />
              </div>
              <p style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                color: "#7A746E",
                letterSpacing: "0.02em",
              }}>
                {loading
                  ? progressStep === 1
                    ? "Étape 1/2 · Validation du dossier"
                    : "Étape 2/2 · Enregistrement de la candidature"
                  : "Votre candidature apparaîtra ensuite dans la page d’état."}
              </p>
              {errorMsg && (
                <p style={{
                  margin: "10px 0 0",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#B91C1C",
                }}>
                  {errorMsg}
                </p>
              )}
            </div>

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
    </div>
  );
}
