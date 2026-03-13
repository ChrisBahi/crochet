"use client"

import { updateProfile } from "./actions"

const SECTORS = [
  { value: "sante", label: "Santé" },
  { value: "tech", label: "Technologie" },
  { value: "energie", label: "Énergie" },
  { value: "finance", label: "Finance" },
  { value: "industrie", label: "Industrie" },
  { value: "immobilier", label: "Immobilier" },
  { value: "education", label: "Éducation" },
  { value: "consumer", label: "Consumer" },
]

const GEOS = [
  { value: "france", label: "France" },
  { value: "europe", label: "Europe" },
  { value: "usa", label: "États-Unis" },
  { value: "mena", label: "MENA" },
  { value: "asie", label: "Asie" },
  { value: "global", label: "Global" },
]

type Props = {
  profile: {
    firm?: string | null
    role?: string | null
    country?: string | null
    ticket_min?: number | null
    ticket_max?: number | null
    sectors?: string[] | null
    geos?: string[] | null
  } | null
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 13,
  color: "#0A0A0A",
  border: "1px solid #E0DAD0",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7A746E",
  marginBottom: 6,
  display: "block",
}

function CheckboxGroup({
  name,
  options,
  selected,
}: {
  name: string
  options: { value: string; label: string }[]
  selected: string[]
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map(opt => (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            border: "1px solid #E0DAD0",
            cursor: "pointer",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: "#0A0A0A",
          }}
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            defaultChecked={selected.includes(opt.value)}
            style={{ accentColor: "#0A0A0A" }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export function ProfileEditForm({ profile }: Props) {
  return (
    <form action={updateProfile} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Identity */}
      <div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid #E0DAD0",
        }}>
          Identité
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
          <div>
            <label style={labelStyle} htmlFor="firm">Structure / Fonds</label>
            <input
              id="firm"
              name="firm"
              type="text"
              defaultValue={profile?.firm ?? ""}
              style={inputStyle}
              placeholder="Nom de la structure"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="role">Rôle</label>
            <input
              id="role"
              name="role"
              type="text"
              defaultValue={profile?.role ?? ""}
              style={inputStyle}
              placeholder="ex. Partner, CEO, CFO"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="country">Pays</label>
            <input
              id="country"
              name="country"
              type="text"
              defaultValue={profile?.country ?? ""}
              style={inputStyle}
              placeholder="ex. France"
            />
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid #E0DAD0",
        }}>
          Capacité financière
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
          <div>
            <label style={labelStyle} htmlFor="ticket_min">Ticket min. (€)</label>
            <input
              id="ticket_min"
              name="ticket_min"
              type="number"
              min={0}
              defaultValue={profile?.ticket_min ?? ""}
              style={inputStyle}
              placeholder="ex. 100000"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ticket_max">Ticket max. (€)</label>
            <input
              id="ticket_max"
              name="ticket_max"
              type="number"
              min={0}
              defaultValue={profile?.ticket_max ?? ""}
              style={inputStyle}
              placeholder="ex. 5000000"
            />
          </div>
        </div>
      </div>

      {/* Sectors */}
      <div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid #E0DAD0",
        }}>
          Secteurs d&apos;intérêt
        </div>
        <CheckboxGroup
          name="sectors"
          options={SECTORS}
          selected={profile?.sectors ?? []}
        />
      </div>

      {/* Geos */}
      <div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid #E0DAD0",
        }}>
          Zones géographiques
        </div>
        <CheckboxGroup
          name="geos"
          options={GEOS}
          selected={profile?.geos ?? []}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
        <button
          type="submit"
          style={{
            padding: "12px 32px",
            background: "#0A0A0A",
            color: "#FFFFFF",
            border: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Enregistrer
        </button>
        <a
          href="/app/profile"
          style={{
            padding: "12px 28px",
            background: "transparent",
            color: "#7A746E",
            border: "1px solid #E0DAD0",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Annuler
        </a>
      </div>

    </form>
  )
}
