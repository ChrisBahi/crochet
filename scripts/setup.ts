#!/usr/bin/env ts-node
/**
 * scripts/setup.ts
 *
 * Usage:
 *   1. Dans .env.local, ajouter :
 *        SUPABASE_SERVICE_ROLE_KEY=xxx    (Supabase → Settings → API)
 *        STRIPE_SECRET_KEY=sk_live_xxx    (Stripe → Developers → API keys)
 *
 *   2. npm run setup
 *
 *   3. Copier les price IDs affichés dans Vercel env vars
 */

import * as fs from "fs"
import * as path from "path"

// ── Charger .env.local ────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..")
const envFile = path.join(ROOT, ".env.local")
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STRIPE_SECRET_KEY  = process.env.STRIPE_SECRET_KEY!

// ─── 1. Apply Supabase migration ─────────────────────────────────────────────

async function applyMigration() {
  console.log("📦  Application de la migration Supabase…")

  if (!SERVICE_ROLE_KEY) {
    console.error("❌  SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local")
    console.log("   → Supabase Dashboard → Settings → API → service_role key")
    return false
  }

  const sql = fs.readFileSync(
    path.resolve(ROOT, "supabase/migrations/20260315000002_subscriptions.sql"),
    "utf8"
  )

  // Try Supabase SQL via pg/query endpoint (requires service role)
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!projectRef) {
    console.error("❌  NEXT_PUBLIC_SUPABASE_URL invalide")
    return false
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    // Expected if endpoint requires management API key instead of service role
    console.error(`❌  Migration échouée via API (${res.status}): ${text.slice(0, 200)}`)
    console.log("")
    console.log("👉  Applique manuellement dans Supabase SQL Editor :")
    console.log("    Dashboard → SQL Editor → New query → coller le fichier :")
    console.log("    supabase/migrations/20260315000002_subscriptions.sql")
    return false
  }

  console.log("✅  Migration 20260315000002_subscriptions.sql appliquée")
  return true
}

// ─── 2. Create Stripe products & prices ──────────────────────────────────────

async function stripePost(endpoint: string, params: Record<string, string>): Promise<{ id: string }> {
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(`Stripe ${endpoint}: ${err?.error?.message ?? res.status}`)
  }
  return res.json() as Promise<{ id: string }>
}

const PLANS = [
  { name: "Starter", amount: "29000", key: "STRIPE_PRICE_STARTER" },
  { name: "Pro",     amount: "59000", key: "STRIPE_PRICE_PRO"     },
  { name: "Scale",   amount: "149000", key: "STRIPE_PRICE_SCALE"  },
]

async function createStripeProducts(): Promise<Record<string, string>> {
  console.log("\n💳  Création des produits Stripe…")

  if (!STRIPE_SECRET_KEY) {
    console.error("❌  STRIPE_SECRET_KEY manquant dans .env.local")
    console.log("   → Stripe Dashboard → Developers → API keys → Secret key")
    return {}
  }

  const results: Record<string, string> = {}

  for (const plan of PLANS) {
    try {
      const product = await stripePost("products", {
        name: `Crochet ${plan.name}`,
        description: `Plan ${plan.name} — accès complet au réseau Crochet`,
      })

      const price = await stripePost("prices", {
        product: product.id,
        unit_amount: plan.amount,
        currency: "eur",
        "recurring[interval]": "month",
      })

      results[plan.key] = price.id
      console.log(`   ✅  ${plan.name.padEnd(8)} product=${product.id}  →  price=${price.id}`)
    } catch (e) {
      console.error(`   ❌  ${plan.name}: ${(e as Error).message}`)
    }
  }

  return results
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀  Setup Crochet — Supabase + Stripe\n")
  console.log(`    Supabase : ${SUPABASE_URL}`)
  console.log(`    Stripe   : ${STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.slice(0, 12) + "…" : "⚠️  manquant"}`)
  console.log("")

  await applyMigration()

  const prices = await createStripeProducts()

  if (Object.keys(prices).length > 0) {
    console.log("\n══════════════════════════════════════════════════════")
    console.log("📋  Variables à ajouter dans Vercel :")
    console.log("    Vercel → projet → Settings → Environment Variables")
    console.log("══════════════════════════════════════════════════════")
    for (const [key, val] of Object.entries(prices)) {
      console.log(`  ${key}=${val}`)
    }
    console.log(`  STRIPE_SECRET_KEY=sk_live_…          (déjà en .env.local)`)
    console.log(`  STRIPE_WEBHOOK_SECRET=whsec_…        (étape suivante)`)
    console.log("")
    console.log("🔗  Webhook Stripe :")
    console.log("    Dashboard → Developers → Webhooks → Add endpoint")
    console.log("    URL   : https://crochett.ai/api/stripe/webhook")
    console.log("    Events: checkout.session.completed")
    console.log("            customer.subscription.updated")
    console.log("            customer.subscription.deleted")
    console.log("    → Signing secret → STRIPE_WEBHOOK_SECRET dans Vercel")
    console.log("══════════════════════════════════════════════════════")
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
