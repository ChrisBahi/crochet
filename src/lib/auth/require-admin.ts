import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser } from "./require-user";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!getAdminEmails().includes(user.email ?? "")) redirect("/app");
  return user;
}

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  return getAdminEmails().includes(user.email);
}
