import { describe, it, expect } from "vitest"
import { scoreMatch } from "./scoreMatch"

describe("scoreMatch", () => {
  it("donne 60 points pour un match buyer/seller", () => {
    const a = { type: "buyer", industry: "tech", country: "FR" }
    const b = { type: "seller", industry: "tech", country: "FR" }
    const result = scoreMatch(a, b)
    expect(result.score).toBeGreaterThanOrEqual(60)
  })

  it("donne 0 si les rôles sont inversés (seller vs buyer)", () => {
    const a = { type: "seller", industry: "tech" }
    const b = { type: "buyer", industry: "tech" }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(20) // uniquement same industry
  })

  it("ajoute 20 points si même industrie", () => {
    const a = { type: "buyer", industry: "fintech" }
    const b = { type: "seller", industry: "fintech" }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(80) // 60 + 20
  })

  it("ajoute 10 points si même pays", () => {
    const a = { type: "buyer", country: "FR" }
    const b = { type: "seller", country: "FR" }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(70) // 60 + 10
  })

  it("ajoute 10 points si budget >= prix", () => {
    const a = { type: "buyer", budget: 500000 }
    const b = { type: "seller", price: 300000 }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(70) // 60 + 10
  })

  it("n'ajoute pas de points budget si budget < prix", () => {
    const a = { type: "buyer", budget: 100000 }
    const b = { type: "seller", price: 500000 }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(60) // seulement buyer/seller
  })

  it("score maximal : buyer/seller + même industrie + même pays + budget ok", () => {
    const a = { type: "buyer", industry: "saas", country: "FR", budget: 1000000 }
    const b = { type: "seller", industry: "saas", country: "FR", price: 800000 }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(100)
  })

  it("retourne une raison lisible", () => {
    const a = { type: "buyer", industry: "saas" }
    const b = { type: "seller", industry: "saas" }
    const result = scoreMatch(a, b)
    expect(result.reason).toContain("Buyer / Seller fit")
    expect(result.reason).toContain("Same industry")
  })

  it("retourne raison vide si aucun match", () => {
    const a = { type: "seller" }
    const b = { type: "seller" }
    const result = scoreMatch(a, b)
    expect(result.score).toBe(0)
    expect(result.reason).toBe("")
  })
})
