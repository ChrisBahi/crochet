import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn()
  class MockAnthropic {
    messages = { create: mockCreate }
  }
  ;(MockAnthropic as unknown as Record<string, unknown>).__mockCreate = mockCreate
  return { default: MockAnthropic, __mockCreate: mockCreate }
})

import Anthropic from "@anthropic-ai/sdk"
import {
  scoreMatch,
  sectorCompatibility,
  geoCompatibility,
  areComplementary,
  amountCompatibility,
  stageCompatibility,
  structuredScore,
} from "./scoreMatch"

const mockCreate = (Anthropic as unknown as { __mockCreate: ReturnType<typeof vi.fn> }).__mockCreate

function makeResponse(p_score: number, why: string[]) {
  return {
    content: [{ type: "text", text: JSON.stringify({ p_score, why }) }],
  }
}

beforeEach(() => {
  mockCreate.mockReset()
})

describe("scoreMatch", () => {
  it("retourne p_score et why[] depuis Claude", async () => {
    mockCreate.mockResolvedValue(makeResponse(82, [
      "Acheteur industriel cherchant une acquisition en France",
      "Vendeur PME industrielle rentable avec historique financier solide",
    ]))

    const result = await scoreMatch(
      { title: "Acquéreur industriel", deal_type: "cession", sector: "industrie", geo: "france" },
      { title: "PME industrielle à céder", deal_type: "cession", sector: "industrie", geo: "france" }
    )

    expect(result.p_score).toBe(82)
    expect(result.why).toHaveLength(2)
    expect(result.why[0]).toContain("Acheteur")
  })

  it("retourne p_score 0 et why vide si la réponse Claude est invalide", async () => {
    mockCreate.mockResolvedValue({ content: [{ type: "text", text: "{}" }] })

    const result = await scoreMatch({}, {})

    expect(result.p_score).toBe(0)
    expect(result.why).toEqual([])
  })

  it("arrondit p_score à l'entier le plus proche", async () => {
    mockCreate.mockResolvedValue(makeResponse(73.6, ["Match partiel"]))

    const result = await scoreMatch({}, {})

    expect(result.p_score).toBe(74)
  })

  it("filtre les éléments non-string dans why[]", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ p_score: 70, why: ["Raison valide", null, 42, "Autre raison"] }) }],
    })

    const result = await scoreMatch({}, {})

    expect(result.why).toEqual(["Raison valide", "Autre raison"])
  })

  it("passe title, deal_type, sector, geo, stage, description et données financières au prompt", async () => {
    mockCreate.mockResolvedValue(makeResponse(70, ["Ok"]))

    await scoreMatch(
      { title: "Fonds Growth A", deal_type: "equity", sector: "tech", geo: "europe", stage: "series-a", description: "Cherche SaaS", revenue: 500000, valuation: 5000000 },
      { title: "SaaS B2B", deal_type: "equity", sector: "tech", geo: "france", stage: "series-a", description: "Lève 5M€", amount: 5000000 }
    )

    const prompt = mockCreate.mock.calls[0][0].messages[0].content as string
    expect(prompt).toContain("Fonds Growth A")
    expect(prompt).toContain("SaaS B2B")
    expect(prompt).toContain("series-a")
  })

  it("limite why[] à 3 éléments maximum", async () => {
    mockCreate.mockResolvedValue(makeResponse(80, ["R1", "R2", "R3", "R4", "R5"]))

    const result = await scoreMatch({}, {})

    expect(result.why).toHaveLength(3)
  })
})

describe("sectorCompatibility", () => {
  it("retourne 30 pour secteurs identiques", () => {
    expect(sectorCompatibility("tech", "tech")).toBe(30)
    expect(sectorCompatibility("industrie", "industrie")).toBe(30)
  })

  it("retourne 20 pour secteurs du même groupe", () => {
    expect(sectorCompatibility("tech", "saas")).toBe(20)
    expect(sectorCompatibility("santé", "medtech")).toBe(20)
  })

  it("retourne 0 pour secteurs incompatibles", () => {
    expect(sectorCompatibility("tech", "immobilier")).toBe(0)
    expect(sectorCompatibility("industrie", "finance")).toBe(0)
  })

  it("retourne 10 (neutre) si un secteur manque", () => {
    expect(sectorCompatibility(undefined, "tech")).toBe(10)
    expect(sectorCompatibility("tech", undefined)).toBe(10)
  })
})

describe("geoCompatibility", () => {
  it("retourne 20 pour géographies identiques", () => {
    expect(geoCompatibility("france", "france")).toBe(20)
  })

  it("retourne 14 pour géographies compatibles (france ↔ europe)", () => {
    expect(geoCompatibility("france", "europe")).toBe(14)
    expect(geoCompatibility("europe", "france")).toBe(14)
  })

  it("retourne 14 pour global ↔ france", () => {
    expect(geoCompatibility("global", "france")).toBe(14)
  })

  it("retourne 0 pour géographies incompatibles", () => {
    expect(geoCompatibility("usa", "asie")).toBe(0)
  })
})

describe("areComplementary", () => {
  it("accepte cession + equity", () => {
    expect(areComplementary("cession", "equity")).toBe(true)
    expect(areComplementary("equity", "cession")).toBe(true)
  })

  it("accepte cession + cession", () => {
    expect(areComplementary("cession", "cession")).toBe(true)
  })

  it("accepte equity + debt", () => {
    expect(areComplementary("equity", "debt")).toBe(true)
  })

  it("retourne true si un type manque (pas de filtrage)", () => {
    expect(areComplementary(undefined, "cession")).toBe(true)
    expect(areComplementary("equity", undefined)).toBe(true)
  })
})

describe("amountCompatibility", () => {
  it("retourne 25 pour montants dans un rapport ≤ 2", () => {
    expect(amountCompatibility(1000000, 1500000)).toBe(25)
    expect(amountCompatibility(1000000, 2000000)).toBe(25)
  })

  it("retourne 15 pour rapport entre 2 et 5", () => {
    expect(amountCompatibility(1000000, 3000000)).toBe(15)
  })

  it("retourne 0 pour rapport > 10", () => {
    expect(amountCompatibility(100000, 2000000)).toBe(0)
  })

  it("retourne 10 (neutre) si un montant manque", () => {
    expect(amountCompatibility(null, 1000000)).toBe(10)
    expect(amountCompatibility(undefined, undefined)).toBe(10)
  })
})

describe("structuredScore", () => {
  it("score élevé pour deux dossiers très compatibles", () => {
    const a = { sector: "tech", geo: "france", amount: 2000000, stage: "series-a" }
    const b = { sector: "tech", geo: "france", amount: 2000000, stage: "series-a" }
    expect(structuredScore(a, b)).toBeGreaterThanOrEqual(70)
  })

  it("score faible pour dossiers incompatibles", () => {
    const a = { sector: "tech", geo: "france", amount: 100000, stage: "pre-seed" }
    const b = { sector: "immobilier", geo: "usa", amount: 50000000, stage: "mature" }
    expect(structuredScore(a, b)).toBeLessThan(30)
  })
})
