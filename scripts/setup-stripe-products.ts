import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

async function main() {
  console.log("Creating Stripe products and prices...\n");

  // Starter
  const starter = await stripe.products.create({
    name: "Starter",
    description: "Pour les conseillers indépendants",
  });
  const starterPrice = await stripe.prices.create({
    product: starter.id,
    unit_amount: 29000, // €290.00
    currency: "eur",
    recurring: { interval: "month" },
    nickname: "Starter mensuel",
  });
  console.log(`✓ Starter created`);
  console.log(`  Product ID: ${starter.id}`);
  console.log(`  Price ID:   ${starterPrice.id}\n`);

  // Pro
  const pro = await stripe.products.create({
    name: "Pro",
    description: "Pour les fonds et family offices",
  });
  const proPrice = await stripe.prices.create({
    product: pro.id,
    unit_amount: 59000, // €590.00
    currency: "eur",
    recurring: { interval: "month" },
    nickname: "Pro mensuel",
  });
  console.log(`✓ Pro created`);
  console.log(`  Product ID: ${pro.id}`);
  console.log(`  Price ID:   ${proPrice.id}\n`);

  // Scale
  const scale = await stripe.products.create({
    name: "Scale",
    description: "Pour les boutiques M&A et structures multi-fonds",
  });
  const scalePrice = await stripe.prices.create({
    product: scale.id,
    unit_amount: 149000, // €1490.00
    currency: "eur",
    recurring: { interval: "month" },
    nickname: "Scale mensuel",
  });
  console.log(`✓ Scale created`);
  console.log(`  Product ID: ${scale.id}`);
  console.log(`  Price ID:   ${scalePrice.id}\n`);

  console.log("=== Add these to your .env.local ===");
  console.log(`STRIPE_PRICE_STARTER=${starterPrice.id}`);
  console.log(`STRIPE_PRICE_PRO=${proPrice.id}`);
  console.log(`STRIPE_PRICE_SCALE=${scalePrice.id}`);
}

main().catch(console.error);
