export function scoreMatch(a: Record<string, unknown>, b: Record<string, unknown>) {

  let score = 0
  const reason: string[] = []

  if (a.type === "buyer" && b.type === "seller") {
    score += 60
    reason.push("Buyer / Seller fit")
  }

  if (a.industry && b.industry && a.industry === b.industry) {
    score += 20
    reason.push("Same industry")
  }

  if (a.country && b.country && a.country === b.country) {
    score += 10
    reason.push("Same country")
  }

  if (a.budget && b.price && a.budget >= b.price) {
    score += 10
    reason.push("Budget match")
  }

  return {
    score,
    reason: reason.join(", ")
  }
}
