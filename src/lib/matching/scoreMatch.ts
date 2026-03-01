export function scoreMatch(a: any, b: any) {

  let score = 0
  let reason = []

  if (a.type === "buyer" && b.type === "seller") {
    score += 60
    reason.push("Buyer / Seller fit")
  }

  if (a.industry === b.industry) {
    score += 20
    reason.push("Same industry")
  }

  if (a.country === b.country) {
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
