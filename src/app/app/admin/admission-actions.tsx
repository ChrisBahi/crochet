"use client";

import { useTransition } from "react";
import { approveAdmission, rejectAdmission, resetAdmission } from "./actions";

const btn = (
  bg: string,
  color: string,
  border?: string
): React.CSSProperties => ({
  padding: "6px 14px",
  background: bg,
  color,
  border: border ?? "none",
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "opacity 0.15s",
});

export function AdmissionActions({
  id,
  email,
  name,
  status,
}: {
  id: string;
  email: string;
  name: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "approved") {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#2D6A4F",
          fontWeight: 600,
        }}>
          Invitation envoyée
        </span>
        <button
          disabled={pending}
          style={{ ...btn("transparent", "#7A746E", "1px solid #E0DAD0"), opacity: pending ? 0.5 : 1 }}
          onClick={() => startTransition(() => resetAdmission(id))}
        >
          Réinitialiser
        </button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#7A746E",
          fontWeight: 600,
        }}>
          Refusé
        </span>
        <button
          disabled={pending}
          style={{ ...btn("transparent", "#7A746E", "1px solid #E0DAD0"), opacity: pending ? 0.5 : 1 }}
          onClick={() => startTransition(() => resetAdmission(id))}
        >
          Réinitialiser
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        disabled={pending}
        style={{ ...btn("#0A0A0A", "#FFFFFF"), opacity: pending ? 0.5 : 1 }}
        onClick={() => startTransition(() => approveAdmission(id, email, name))}
      >
        Approuver
      </button>
      <button
        disabled={pending}
        style={{ ...btn("transparent", "#7A746E", "1px solid #E0DAD0"), opacity: pending ? 0.5 : 1 }}
        onClick={() => startTransition(() => rejectAdmission(id))}
      >
        Refuser
      </button>
    </div>
  );
}
