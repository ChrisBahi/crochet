import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-02-25.clover" })
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan ?? "starter"
    const subscriptionId = session.subscription as string

    if (!userId) return NextResponse.json({ ok: true })

    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const subAny = sub as unknown as { current_period_end?: number }

    await admin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      plan,
      status: "active",
      current_period_end: subAny.current_period_end ? new Date(subAny.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" })
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (!userId) return NextResponse.json({ ok: true })

    const plan = (sub.metadata?.plan ?? "starter") as string
    const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status
    const subAny2 = sub as unknown as { current_period_end?: number }

    await admin.from("subscriptions")
      .update({
        plan,
        status,
        current_period_end: subAny2.current_period_end ? new Date(subAny2.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id)
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    await admin.from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", sub.id)
  }

  return NextResponse.json({ ok: true })
}
