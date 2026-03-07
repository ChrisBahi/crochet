import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn(() => ({
      messages: { create: mockCreate },
    })),
    __mockCreate: mockCreate,
  }
})

import Anthropic from "@anthropic-ai/sdk"
import { scoreMatch } from "./scoreMatch"

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

  it("passe title, deal_type, sector, geo, stage, description au prompt", async () => {
    mockCreate.mockResolvedValue(makeResponse(70, ["Ok"]))

    await scoreMatch(
      { title: "Fonds Growth A", deal_type: "equity", sector: "tech", geo: "europe", stage: "series-a", description: "Cherche SaaS" },
      { title: "SaaS B2B", deal_type: "equity", sector: "tech", geo: "france", stage: "series-a", description: "Lève 5M€" }
    )

    const prompt = mockCreate.mock.calls[0][0].messages[0].content as string
    expect(prompt).toContain("Fonds Growth A")
    expect(prompt).toContain("SaaS B2B")
    expect(prompt).toContain("series-a")
  })
})
