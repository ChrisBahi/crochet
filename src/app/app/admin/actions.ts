"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveAdmission(id: string, email: string, name: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("admission_requests")
    .update({ status: "approved" })
    .eq("id", id);

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
  });

  if (error && !error.message.includes("already")) {
    throw new Error(error.message);
  }

  revalidatePath("/app/admin");
}

export async function rejectAdmission(id: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("admission_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  revalidatePath("/app/admin");
}

export async function resetAdmission(id: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("admission_requests")
    .update({ status: "pending" })
    .eq("id", id);

  revalidatePath("/app/admin");
}
