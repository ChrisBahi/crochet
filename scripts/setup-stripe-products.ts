const KEY = process.env.STRIPE_SECRET_KEY!;
const BASE = "https://api.stripe.com/v1";

async function post(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return res.json() as Promise<Record<string, string>>;
}

async function main() {
  const plans = [
    { name: "Starter", description: "Pour les conseillers independants", amount: "29000" },
    { name: "Pro", description: "Pour les fonds et family offices", amount: "59000" },
    { name: "Scale", description: "Pour les boutiques M&A et structures multi-fonds", amount: "149000" },
  ];

  for (const plan of plans) {
    const product = await post("/products", { name: plan.name, description: plan.description });
    const price = await post("/prices", {
      product: product.id,
      unit_amount: plan.amount,
      currency: "eur",
      "recurring[interval]": "month",
    });
    console.log(`✓ ${plan.name}`);
    console.log(`  STRIPE_PRICE_${plan.name.toUpperCase()}=${price.id}`);
  }
}

main().catch(console.error);
