import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await req.json();
  if (!priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  // Get active workspace
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const workspaceId = settings?.active_workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "No active workspace" }, { status: 400 });
  }

  // Get or create Stripe customer
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, stripe_customer_id")
    .eq("id", workspaceId)
    .single();

  let customerId = workspace?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: workspace?.name ?? user.email,
      metadata: { workspace_id: workspaceId, user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("workspaces")
      .update({ stripe_customer_id: customerId })
      .eq("id", workspaceId);
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { workspace_id: workspaceId },
    },
    success_url: `${origin}/app/billing?success=1`,
    cancel_url: `${origin}/app/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
