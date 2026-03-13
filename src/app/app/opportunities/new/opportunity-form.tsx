"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        opacity: pending ? 0.6 : 1,
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? "Creating…" : "Create"}
    </button>
  )
}

export function OpportunityForm({
  action,
}: {
  action: (prevState: { error?: string | null }, formData: FormData) => Promise<{ error?: string | null }>
}) {
  const [state, formAction] = useActionState(action, { error: null })

  return (
    <form action={formAction} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      {state?.error ? (
        <div style={{ padding: 10, border: "1px solid #f5c2c7", borderRadius: 10 }}>
          <span style={{ color: "#b02a37" }}>{state.error}</span>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" placeholder="e.g. Need a React dev" />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" placeholder="Details…" rows={4} />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}>
          <option value="">Select type…</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="industry">Industry</label>
        <input id="industry" name="industry" placeholder="e.g. SaaS, FinTech, Healthcare" />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="country">Country</label>
        <input id="country" name="country" placeholder="e.g. France, USA" />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="budget">Budget / Price (€)</label>
        <input id="budget" name="budget" type="number" min="0" placeholder="e.g. 10000" />
      </div>

      <SubmitButton />
    </form>
  )
}
