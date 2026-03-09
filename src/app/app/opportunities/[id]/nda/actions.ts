"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { revalidatePath } from "next/cache"

export async function signNda(opportunityId: string, ndaReference: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase.from("nda_signatures").upsert({
    opportunity_id: opportunityId,
    user_id: user.id,
  }, { onConflict: "opportunity_id,user_id" })

  if (error) throw new Error(error.message)

  revalidatePath(`/app/opportunities/${opportunityId}/nda`)
}
