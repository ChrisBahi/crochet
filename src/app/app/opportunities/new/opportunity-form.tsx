"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useState } from "react"

// ── Styles helpers ──────────────────────────────────────────────
const label: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#7A746E",
  marginBottom: 6,
  display: "block",
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E0DAD0",
  background: "#FFFFFF",
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 14,
  color: "#0A0A0A",
  outline: "none",
  boxSizing: "border-box",
}

const select: React.CSSProperties = {
  ...input,
  cursor: "pointer",
  appearance: "none",
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#7A746E",
  marginBottom: 14,
  paddingBottom: 10,
  borderBottom: "1px solid #E0DAD0",
}

// ── Deal-type specific doc fields ────────────────────────────────
const DOC_FIELDS: Record<string, { name: string; label: string; placeholder: string }[]> = {
  cession: [
    { name: "doc_bilan_url", label: "Lien bilans 3 ans", placeholder: "Drive, Dropbox, Notion…" },
    { name: "doc_kbis_url", label: "Lien KBIS / statuts", placeholder: "Drive, Dropbox…" },
    { name: "doc_teaser_url", label: "Lien teaser / mémo vendeur", placeholder: "PDF en ligne…" },
  ],
  equity: [
    { name: "pitch_deck_url", label: "Lien pitch deck", placeholder: "Docsend, Notion, Drive…" },
    { name: "doc_captable_url", label: "Lien cap table", placeholder: "Spreadsheet, Carta…" },
    { name: "doc_dataroom_url", label: "Lien data room", placeholder: "Drive, Notion…" },
  ],
  debt: [
    { name: "doc_bp_url", label: "Lien business plan", placeholder: "Drive, Notion…" },
    { name: "doc_bilan_url", label: "Lien bilans / comptes", placeholder: "Drive, Dropbox…" },
  ],
  "revenue-share": [
    { name: "pitch_deck_url", label: "Lien deck / présentation", placeholder: "Docsend, Drive…" },
    { name: "doc_bilan_url", label: "Lien justificatifs de revenus", placeholder: "Drive, Dropbox…" },
  ],
  succession: [
    { name: "doc_expertise_url", label: "Lien expertise notariale", placeholder: "Drive, Dropbox…" },
    { name: "doc_patrimoine_url", label: "Lien situation patrimoniale", placeholder: "PDF, Drive…" },
  ],
  immobilier: [
    { name: "doc_expertise_url", label: "Lien expertise / estimation", placeholder: "PDF, Drive…" },
    { name: "doc_bail_url", label: "Lien bail / historique loyers", placeholder: "Drive, Dropbox…" },
    { name: "doc_teaser_url", label: "Lien mémo descriptif", placeholder: "PDF en ligne…" },
  ],
}

const AMOUNT_LABELS: Record<string, string> = {
  cession: "Prix de cession cible (€)",
  equity: "Montant de la levée (€)",
  debt: "Montant souhaité (€)",
  "revenue-share": "Montant recherché (€)",
  succession: "Valeur estimée du patrimoine (€)",
  immobilier: "Prix de vente / levée (€)",
}

// ── Sub-components ───────────────────────────────────────────────
function Field({
  name, labelText, children,
}: {
  name?: string; labelText: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={name} style={label}>{labelText}</label>
      {children}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "12px 28px",
        background: pending ? "#7A746E" : "#0A0A0A",
        color: "#FFFFFF",
        border: "none",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        cursor: pending ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {pending ? "Qualification en cours…" : "Soumettre le dossier"}
    </button>
  )
}

// ── Main form ────────────────────────────────────────────────────
export function OpportunityForm({
  action,
}: {
  action: (
    prevState: { error?: string | null },
    formData: FormData
  ) => Promise<{ error?: string | null }>
}) {
  const [state, formAction] = useFormState(action, { error: null })
  const [dealType, setDealType] = useState("")

  const docFields = DOC_FIELDS[dealType] ?? []
  const amountLabel = AMOUNT_LABELS[dealType] ?? "Montant (€)"

  return (
    <form action={formAction} style={{ display: "grid", gap: 28 }}>
      {state?.error && (
        <div style={{
          padding: "10px 14px",
          border: "1px solid #f5c2c7",
          background: "#fff5f5",
        }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#b02a37",
          }}>
            {state.error}
          </span>
        </div>
      )}

      {/* ── Section 1 : Identification ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>Identification</div>

        <Field name="title" labelText="Titre du dossier *">
          <input id="title" name="title" required placeholder="ex. Cession PME industrielle Lyon — 4.8M€ CA" style={input} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field name="deal_type" labelText="Type de dossier *">
            <select
              id="deal_type"
              name="deal_type"
              required
              style={select}
              value={dealType}
              onChange={e => setDealType(e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              <option value="cession">Cession / Transmission</option>
              <option value="equity">Levée de fonds (equity)</option>
              <option value="debt">Dette / Financement</option>
              <option value="revenue-share">Revenue share</option>
              <option value="succession">Succession / Patrimoine</option>
              <option value="immobilier">Immobilier</option>
            </select>
          </Field>

          <Field name="sector" labelText="Secteur">
            <select id="sector" name="sector" style={select}>
              <option value="">— Sélectionner —</option>
              <option value="industrie">Industrie</option>
              <option value="tech">Technologie / SaaS</option>
              <option value="sante">Santé</option>
              <option value="energie">Énergie</option>
              <option value="finance">Finance</option>
              <option value="immobilier">Immobilier</option>
              <option value="education">Éducation</option>
              <option value="consumer">Consumer / Retail</option>
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field name="stage" labelText="Stade">
            <select id="stage" name="stage" style={select}>
              <option value="">— Sélectionner —</option>
              <option value="pre-seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Série A</option>
              <option value="series-b">Série B+</option>
              <option value="growth">Growth / Rentable</option>
              <option value="mature">Mature / Transmission</option>
            </select>
          </Field>

          <Field name="geo" labelText="Géographie">
            <select id="geo" name="geo" style={select}>
              <option value="">— Sélectionner —</option>
              <option value="france">France</option>
              <option value="europe">Europe</option>
              <option value="usa">États-Unis</option>
              <option value="mena">MENA</option>
              <option value="asie">Asie</option>
              <option value="global">Global</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Section 2 : Description ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>Description du dossier</div>

        <Field name="description" labelText="Présentation courte *">
          <textarea
            id="description"
            name="description"
            required
            placeholder="Société, activité, positionnement, contexte de l'opération…"
            rows={4}
            style={{ ...input, resize: "vertical" }}
          />
        </Field>

        <Field name="long_description" labelText="Description approfondie">
          <textarea
            id="long_description"
            name="long_description"
            placeholder="Historique, équipe, avantages compétitifs, risques connus, contexte de cession…"
            rows={6}
            style={{ ...input, resize: "vertical" }}
          />
        </Field>
      </div>

      {/* ── Section 3 : Financiers ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>Données financières</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field name="amount" labelText={amountLabel}>
            <input id="amount" name="amount" type="number" placeholder="0" style={input} />
          </Field>

          <Field name="valuation" labelText="Valorisation (€)">
            <input id="valuation" name="valuation" type="number" placeholder="0" style={input} />
          </Field>

          <Field name="revenue" labelText="CA / Revenus annuels (€)">
            <input id="revenue" name="revenue" type="number" placeholder="0" style={input} />
          </Field>
        </div>
      </div>

      {/* ── Section 4 : Documents (adaptatifs) ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>
          Documents & liens
          {!dealType && (
            <span style={{ marginLeft: 10, fontStyle: "italic", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
              — sélectionnez un type de dossier pour voir les pièces requises
            </span>
          )}
        </div>

        {docFields.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {docFields.map(f => (
              <Field key={f.name} name={f.name} labelText={f.label}>
                <input id={f.name} name={f.name} type="url" placeholder={f.placeholder} style={input} />
              </Field>
            ))}
          </div>
        )}

        {/* Always: site web */}
        <Field name="website_url" labelText="Site web">
          <input id="website_url" name="website_url" type="url" placeholder="https://…" style={input} />
        </Field>
      </div>

      {/* ── Notice IA masquée ── */}
      <div style={{
        padding: "12px 16px",
        background: "#F5F0E8",
        border: "1px solid #EDE8DF",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#7A746E",
          letterSpacing: "0.1em",
          flexShrink: 0,
          paddingTop: 1,
        }}>
          IA · CONFIDENTIEL
        </span>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: "#7A746E",
          margin: 0,
          lineHeight: 1.7,
        }}>
          Ce dossier sera analysé par le <strong style={{ color: "#0A0A0A", fontWeight: 600 }}>Moteur de qualification CROCHET</strong> qui génère automatiquement un MEMO structuré et un D-Score de qualité.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
