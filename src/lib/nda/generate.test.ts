import { describe, it, expect } from "vitest"

// Test des fonctions pures extraites de generate.ts (sans appel API)

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function partyLine(p: { name: string; firm?: string | null; role?: string | null; country?: string | null; email?: string | null }): string {
  const parts = [p.name]
  if (p.firm) parts.push(p.firm)
  if (p.role) parts.push(p.role)
  if (p.country) parts.push(p.country)
  if (p.email) parts.push(p.email)
  return parts.join(", ")
}

describe("NDA helpers", () => {
  describe("partyLine", () => {
    it("retourne juste le nom si aucun champ optionnel", () => {
      expect(partyLine({ name: "Jean Dupont" })).toBe("Jean Dupont")
    })

    it("inclut firm, role, country et email si présents", () => {
      const result = partyLine({
        name: "Jean Dupont",
        firm: "Acme SAS",
        role: "CEO",
        country: "France",
        email: "jean@acme.fr",
      })
      expect(result).toBe("Jean Dupont, Acme SAS, CEO, France, jean@acme.fr")
    })

    it("ignore les champs null", () => {
      const result = partyLine({
        name: "Marie Martin",
        firm: null,
        role: "CFO",
        country: null,
        email: "marie@corp.fr",
      })
      expect(result).toBe("Marie Martin, CFO, marie@corp.fr")
    })
  })

  describe("formatDate", () => {
    it("retourne une date en format français", () => {
      const date = new Date("2025-01-15")
      const result = formatDate(date)
      expect(result).toMatch(/15/)
      expect(result).toMatch(/2025/)
    })
  })

  describe("référence NDA", () => {
    it("génère une référence à partir de l'opportunityId", () => {
      const opportunityId = "abc12345-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      const ref = `NDA-CROCHET-${opportunityId.slice(0, 8).toUpperCase()}`
      expect(ref).toBe("NDA-CROCHET-ABC12345")
    })
  })
})
