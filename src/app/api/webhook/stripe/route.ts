import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  // Use service role to bypass RLS for webhook updates
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
    : await createServerClient();

  async function updateWorkspace(workspaceId: string, fields: Record<string, unknown>) {
    await supabase.from("workspaces").update(fields).eq("id", workspaceId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.subscription_data?.metadata?.workspace_id
        ?? (session.metadata?.workspace_id as string | undefined);
      if (!workspaceId) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await updateWorkspace(workspaceId, {
        stripe_subscription_id: sub.id,
        stripe_price_id: sub.items.data[0]?.price.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspace_id;
      if (!workspaceId) break;

      await updateWorkspace(workspaceId, {
        stripe_price_id: sub.items.data[0]?.price.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspace_id;
      if (!workspaceId) break;

      await updateWorkspace(workspaceId, {
        stripe_subscription_id: null,
        stripe_price_id: null,
        subscription_status: "canceled",
        trial_ends_at: null,
        current_period_end: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
