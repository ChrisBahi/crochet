"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useState, useRef } from "react"

// ── Styles helpers ──────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#7A746E",
  marginBottom: 6,
  display: "block",
}

const inputStyle: React.CSSProperties = {
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
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

// ── Questionnaire de qualification par type de deal ──────────────
type QuestionField = {
  name: string
  label: string
  type: "text" | "select" | "number"
  options?: { value: string; label: string }[]
  placeholder?: string
}

const QUESTIONNAIRE: Record<string, QuestionField[]> = {
  equity: [
    {
      name: "q_growth_rate",
      label: "Taux de croissance annuel sur les 12 derniers mois (%)",
      type: "number",
      placeholder: "ex. 45",
    },
    {
      name: "q_active_customers",
      label: "Nombre de clients ou abonnés actifs",
      type: "number",
      placeholder: "ex. 120",
    },
    {
      name: "q_revenue_type",
      label: "Nature du revenu",
      type: "select",
      options: [
        { value: "arr", label: "Majoritairement récurrent (ARR / MRR)" },
        { value: "mixed", label: "Mixte (récurrent + one-time)" },
        { value: "project", label: "Majoritairement projet / one-time" },
      ],
    },
    {
      name: "q_runway",
      label: "Runway actuel (mois)",
      type: "number",
      placeholder: "ex. 18",
    },
    {
      name: "q_main_risk",
      label: "Principal risque identifié par l'équipe",
      type: "text",
      placeholder: "ex. dépendance client, concurrence, réglementation…",
    },
  ],
  cession: [
    {
      name: "q_cession_reason",
      label: "Motif de cession",
      type: "select",
      options: [
        { value: "retraite", label: "Retraite / transmission familiale" },
        { value: "reorientation", label: "Réorientation stratégique du dirigeant" },
        { value: "croissance", label: "Apport de capitaux pour accélérer" },
        { value: "autre", label: "Autre" },
      ],
    },
    {
      name: "q_dependance_dirigeant",
      label: "Dépendance de l'entreprise vis-à-vis du dirigeant",
      type: "select",
      options: [
        { value: "faible", label: "Faible — équipe et process autonomes" },
        { value: "moderee", label: "Modérée — quelques fonctions clés" },
        { value: "forte", label: "Forte — dirigeant central dans l'opérationnel" },
      ],
    },
    {
      name: "q_employees",
      label: "Nombre d'employés (ETP)",
      type: "number",
      placeholder: "ex. 25",
    },
    {
      name: "q_dette_bancaire",
      label: "Niveau de dette bancaire existante",
      type: "select",
      options: [
        { value: "aucune", label: "Aucune" },
        { value: "moderee", label: "Modérée (< 30 % de la valorisation)" },
        { value: "significative", label: "Significative (> 30 % de la valorisation)" },
      ],
    },
    {
      name: "q_non_concurrence",
      label: "Clause de non-concurrence souhaitée",
      type: "select",
      options: [
        { value: "oui", label: "Oui" },
        { value: "non", label: "Non" },
        { value: "negociable", label: "Négociable" },
      ],
    },
  ],
  debt: [
    {
      name: "q_debt_purpose",
      label: "Objet du financement",
      type: "select",
      options: [
        { value: "bfr", label: "Besoin en fonds de roulement" },
        { value: "investissement", label: "Investissement (équipement, immobilier)" },
        { value: "croissance", label: "Croissance (commercial, recrutement)" },
        { value: "acquisition", label: "Acquisition d'entreprise" },
      ],
    },
    {
      name: "q_repayment_capacity",
      label: "Capacité de remboursement annuelle estimée (€)",
      type: "number",
      placeholder: "ex. 200000",
    },
    {
      name: "q_guarantees",
      label: "Garanties disponibles",
      type: "select",
      options: [
        { value: "caution_personnelle", label: "Caution personnelle du dirigeant" },
        { value: "actifs", label: "Actifs immobiliers / matériels" },
        { value: "bpifrance", label: "Garantie BPI France / publique" },
        { value: "aucune", label: "Aucune garantie spécifique" },
      ],
    },
  ],
  "revenue-share": [
    {
      name: "q_revenue_stability",
      label: "Stabilité du revenu",
      type: "select",
      options: [
        { value: "tres_stable", label: "Très stable — contrats long terme" },
        { value: "stable", label: "Stable — revenus réguliers" },
        { value: "variable", label: "Variable — saisonnier ou projet" },
      ],
    },
    {
      name: "q_growth_rate",
      label: "Taux de croissance annuel (12 derniers mois, %)",
      type: "number",
      placeholder: "ex. 30",
    },
    {
      name: "q_rev_share_amount",
      label: "Part de revenu proposée au partenaire (%)",
      type: "number",
      placeholder: "ex. 15",
    },
  ],
  succession: [
    {
      name: "q_heirs",
      label: "Présence d'héritiers souhaitant reprendre l'activité",
      type: "select",
      options: [
        { value: "oui", label: "Oui" },
        { value: "non", label: "Non" },
        { value: "partiel", label: "Partiellement" },
      ],
    },
    {
      name: "q_timeline",
      label: "Horizon de transmission souhaité",
      type: "select",
      options: [
        { value: "moins_1an", label: "Moins d'1 an" },
        { value: "1_3ans", label: "1 à 3 ans" },
        { value: "3_5ans", label: "3 à 5 ans" },
      ],
    },
    {
      name: "q_fiscal_optim",
      label: "Optimisation fiscale déjà planifiée",
      type: "select",
      options: [
        { value: "oui", label: "Oui (avec notaire / avocat)" },
        { value: "en_cours", label: "En cours" },
        { value: "non", label: "Non" },
      ],
    },
  ],
  immobilier: [
    {
      name: "q_immo_type",
      label: "Type de bien",
      type: "select",
      options: [
        { value: "bureau", label: "Bureaux / locaux commerciaux" },
        { value: "industriel", label: "Industriel / entrepôt" },
        { value: "mixte", label: "Mixte (commerce + logement)" },
        { value: "terrain", label: "Terrain / promotion" },
      ],
    },
    {
      name: "q_occupancy",
      label: "Taux d'occupation actuel (%)",
      type: "number",
      placeholder: "ex. 85",
    },
    {
      name: "q_bail_duration",
      label: "Durée résiduelle du bail principal",
      type: "select",
      options: [
        { value: "moins_3ans", label: "Moins de 3 ans" },
        { value: "3_6ans", label: "3 à 6 ans" },
        { value: "plus_6ans", label: "Plus de 6 ans" },
        { value: "aucun", label: "Vacant / sans bail" },
      ],
    },
  ],
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

// Map signal values to form values
const DEAL_TYPE_MAP: Record<string, string> = {
  cession: "cession",
  levee_fonds: "equity",
  fusion: "cession",
  rachat: "cession",
  partenariat: "equity",
}

const SECTOR_MAP: Record<string, string> = {
  technologie: "tech",
  tech: "tech",
  saas: "tech",
  santé: "sante",
  sante: "sante",
  énergie: "energie",
  energie: "energie",
  finance: "finance",
  industrie: "industrie",
  immobilier: "immobilier",
  éducation: "education",
  education: "education",
  consumer: "consumer",
  retail: "consumer",
}

const GEO_MAP: Record<string, string> = {
  france: "france",
  europe: "europe",
  "états-unis": "usa",
  usa: "usa",
  mena: "mena",
  asie: "asie",
  global: "global",
  monde: "global",
}

type Signal = {
  ca: number | null
  ebitda: number | null
  dette_nette: number | null
  valorisation: number | null
  secteur: string | null
  geo: string | null
  deal_type: string | null
  maturite_score: number
  resume: string
  points_forts: string[]
  alertes: string[]
}

// ── Sub-components ───────────────────────────────────────────────
function Field({ name, labelText, children }: { name?: string; labelText: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={name} style={labelStyle}>{labelText}</label>
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
  const [state, formAction] = useActionState(action, { error: null })

  // Controlled fields (can be auto-populated by AI)
  const [title, setTitle] = useState("")
  const [dealType, setDealType] = useState("")
  const [sector, setSector] = useState("")
  const [geo, setGeo] = useState("")
  const [description, setDescription] = useState("")
  const [revenue, setRevenue] = useState("")
  const [valuation, setValuation] = useState("")

  // PDF upload state
  const [uploading, setUploading] = useState(false)
  const [signal, setSignal] = useState<Signal | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const docFields = DOC_FIELDS[dealType] ?? []
  const amountLabel = AMOUNT_LABELS[dealType] ?? "Montant (€)"

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    setSignal(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok || !data.signal) {
        setUploadError("Le moteur n'a pas pu lire ce document. Remplissez le formulaire manuellement.")
        return
      }

      const s: Signal = data.signal
      setSignal(s)

      // Auto-populate fields from signal
      if (s.resume) {
        const firstSentence = s.resume.split(/[.!?]/)[0]?.trim()
        if (firstSentence && !title) setTitle(firstSentence)
        setDescription(s.resume)
      }
      if (s.deal_type) {
        const mapped = DEAL_TYPE_MAP[s.deal_type.toLowerCase()] ?? ""
        if (mapped) setDealType(mapped)
      }
      if (s.secteur) {
        const key = s.secteur.toLowerCase()
        const mapped = Object.entries(SECTOR_MAP).find(([k]) => key.includes(k))?.[1] ?? ""
        if (mapped) setSector(mapped)
      }
      if (s.geo) {
        const key = s.geo.toLowerCase()
        const mapped = GEO_MAP[key] ?? (key.includes("franc") ? "france" : key.includes("europ") ? "europe" : "")
        if (mapped) setGeo(mapped)
      }
      if (s.ca) setRevenue(String(s.ca))
      if (s.valorisation) setValuation(String(s.valorisation))
    } catch {
      setUploadError("Erreur de connexion. Réessayez ou remplissez manuellement.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form action={formAction} style={{ display: "grid", gap: 28 }}>
      {state?.error && (
        <div style={{ padding: "10px 14px", border: "1px solid #f5c2c7", background: "#fff5f5" }}>
          <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#b02a37" }}>
            {state.error}
          </span>
        </div>
      )}

      {/* ── Upload PDF — LE SIGNAL ── */}
      <div>
        <div style={sectionTitle}>
          Analyse automatique · Upload document
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFileUpload(file)
          }}
          style={{
            border: `1px dashed ${uploading ? "#7A746E" : signal ? "#0A0A0A" : "#E0DAD0"}`,
            padding: "28px 24px",
            cursor: "pointer",
            textAlign: "center",
            background: signal ? "#F5F0E8" : "#FAFAF8",
            transition: "all 0.15s",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.csv"
            style={{ display: "none" }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />

          {uploading ? (
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E" }}>
              <span style={{
                display: "inline-block",
                width: 12,
                height: 12,
                border: "1.5px solid #7A746E",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                marginRight: 10,
                verticalAlign: "middle",
              }} />
              Moteur IA en cours d&apos;analyse…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : signal ? (
            <div>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                color: "#7A746E",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                Signal extrait · Maturité {signal.maturite_score}/100
              </div>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "CA", value: signal.ca ? `${(signal.ca / 1000000).toFixed(1)}M€` : null },
                  { label: "EBITDA", value: signal.ebitda ? `${(signal.ebitda / 1000000).toFixed(1)}M€` : null },
                  { label: "Valorisation", value: signal.valorisation ? `${(signal.valorisation / 1000000).toFixed(1)}M€` : null },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0A0A0A",
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 9,
                      color: "#7A746E",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              {signal.points_forts.length > 0 && (
                <div style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}>
                  {signal.points_forts.map((p, i) => (
                    <span key={i} style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      color: "#0A0A0A",
                      border: "1px solid #E0DAD0",
                      padding: "2px 8px",
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <div style={{
                marginTop: 10,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                color: "#7A746E",
                fontStyle: "italic",
              }}>
                Formulaire pré-rempli — vérifiez et complétez
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13,
                color: "#7A746E",
                marginBottom: 6,
              }}>
                Déposez un PDF, bilan, ou document financier
              </div>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                color: "#C8C2B8",
                letterSpacing: "0.08em",
              }}>
                Le moteur extrait les données et pré-remplit le formulaire
              </div>
            </div>
          )}
        </div>

        {uploadError && (
          <div style={{
            marginTop: 8,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: "#b02a37",
          }}>
            {uploadError}
          </div>
        )}
      </div>

      {/* ── Section 1 : Identification ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>Identification</div>

        <Field name="title" labelText="Titre du dossier *">
          <input
            id="title"
            name="title"
            required
            placeholder="ex. Cession PME industrielle Lyon — 4.8M€ CA"
            style={inputStyle}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field name="deal_type" labelText="Type de dossier *">
            <select
              id="deal_type"
              name="deal_type"
              required
              style={selectStyle}
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
            <select
              id="sector"
              name="sector"
              style={selectStyle}
              value={sector}
              onChange={e => setSector(e.target.value)}
            >
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
            <select id="stage" name="stage" style={selectStyle}>
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
            <select
              id="geo"
              name="geo"
              style={selectStyle}
              value={geo}
              onChange={e => setGeo(e.target.value)}
            >
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
            style={{ ...inputStyle, resize: "vertical" }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Field>

        <Field name="long_description" labelText="Description approfondie">
          <textarea
            id="long_description"
            name="long_description"
            placeholder="Historique, équipe, avantages compétitifs, risques connus, contexte de cession…"
            rows={6}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
      </div>

      {/* ── Section 3 : Financiers ── */}
      <div style={{ display: "grid", gap: 16 }}>
        <div style={sectionTitle}>Données financières</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field name="amount" labelText={amountLabel}>
            <input id="amount" name="amount" type="number" placeholder="0" style={inputStyle} />
          </Field>

          <Field name="valuation" labelText="Valorisation (€)">
            <input
              id="valuation"
              name="valuation"
              type="number"
              placeholder="0"
              style={inputStyle}
              value={valuation}
              onChange={e => setValuation(e.target.value)}
            />
          </Field>

          <Field name="revenue" labelText="CA / Revenus annuels (€)">
            <input
              id="revenue"
              name="revenue"
              type="number"
              placeholder="0"
              style={inputStyle}
              value={revenue}
              onChange={e => setRevenue(e.target.value)}
            />
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
                <input id={f.name} name={f.name} type="url" placeholder={f.placeholder} style={inputStyle} />
              </Field>
            ))}
          </div>
        )}

        <Field name="website_url" labelText="Site web">
          <input id="website_url" name="website_url" type="url" placeholder="https://…" style={inputStyle} />
        </Field>
      </div>

      {/* ── Section 5 : Questionnaire de qualification ── */}
      {dealType && QUESTIONNAIRE[dealType] && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={sectionTitle}>
            Qualification renforcée
            <span style={{
              marginLeft: 10,
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: 0,
              textTransform: "none",
              color: "#9A948E",
            }}>
              — {QUESTIONNAIRE[dealType].length} questions · améliore la précision du D-Score
            </span>
          </div>

          <div style={{
            padding: "10px 14px",
            background: "#F5F0E8",
            border: "1px solid #EDE8DF",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: "#7A746E",
            lineHeight: 1.6,
          }}>
            Ces informations permettent au moteur de qualifier votre dossier avec précision et d&apos;améliorer le D-Score.
          </div>

          {QUESTIONNAIRE[dealType].map((q) => (
            <Field key={q.name} name={q.name} labelText={q.label}>
              {q.type === "select" ? (
                <select id={q.name} name={q.name} style={selectStyle}>
                  <option value="">— Sélectionner —</option>
                  {q.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={q.name}
                  name={q.name}
                  type={q.type === "number" ? "number" : "text"}
                  placeholder={q.placeholder}
                  style={inputStyle}
                />
              )}
            </Field>
          ))}
        </div>
      )}

      {/* ── Notice IA ── */}
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
