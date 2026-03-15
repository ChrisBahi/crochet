"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const firm = formData.get("firm") as string | null
  const role = formData.get("role") as string | null
  const country = formData.get("country") as string | null
  const ticketMin = formData.get("ticket_min") ? Number(formData.get("ticket_min")) : null
  const ticketMax = formData.get("ticket_max") ? Number(formData.get("ticket_max")) : null
  const sectors = formData.getAll("sectors") as string[]
  const geos = formData.getAll("geos") as string[]

  await supabase
    .from("investor_profiles")
    .upsert({
      user_id: user.id,
      firm: firm || null,
      role: role || null,
      country: country || null,
      ticket_min: ticketMin,
      ticket_max: ticketMax,
      sectors,
      geos,
    }, { onConflict: "user_id" })

  revalidatePath("/app/profile")
  redirect("/app/profile")
}
