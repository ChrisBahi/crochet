import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function WelcomePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Read tunnel from user_metadata
  let tunnel = (user.user_metadata?.tunnel as string) ?? "";

  // Fallback: read from admission_requests
  if (!tunnel) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("admission_requests")
      .select("tunnel")
      .eq("email", user.email)
      .maybeSingle();
    tunnel = data?.tunnel ?? "";
  }

  if (tunnel === "cedant") redirect("/welcome/cedant");
  if (tunnel === "repreneur") redirect("/welcome/repreneur");
  if (tunnel === "fonds") redirect("/welcome/fonds");

  // Default fallback (no tunnel detected)
  redirect("/welcome/default");
}
