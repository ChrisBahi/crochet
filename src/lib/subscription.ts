import { createClient } from "@/lib/supabase/server"

export type PlanStatus = "active_paid" | "trial" | "expired"

export async function getPlanStatus(userId: string): Promise<{ status: PlanStatus; plan: string; trialDaysLeft: number }> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_ends_at, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Paid active subscription
  if (sub?.status === "active" && sub.plan !== "trial") {
    return { status: "active_paid", plan: sub.plan, trialDaysLeft: 0 }
  }

  // Trial
  if (sub?.trial_ends_at) {
    const trialEnd = new Date(sub.trial_ends_at)
    const now = new Date()
    const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    if (trialDaysLeft > 0) {
      return { status: "trial", plan: "trial", trialDaysLeft }
    }
  }

  return { status: "expired", plan: "none", trialDaysLeft: 0 }
}
