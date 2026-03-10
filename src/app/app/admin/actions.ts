"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeAdmission } from "@/lib/admission/analyze";
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

  const { data: req } = await admin
    .from("admission_requests")
    .select("email, name")
    .eq("id", id)
    .single();

  await admin
    .from("admission_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  if (req?.email && process.env.RESEND_API_KEY) {
    const firstName = req.name?.split(" ")[0] ?? req.name ?? "Candidat";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CROCHET <no-reply@crochet.app>",
        to: [req.email],
        subject: "Votre candidature CROCHET",
        html: `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · Zone Sécurisée
    </div>
    <h2 style="font-size:22px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.3;">Suite à votre candidature.</h2>
    <p style="font-size:14px;color:#7A746E;line-height:1.75;margin:0 0 24px;">
      Bonjour ${firstName},<br/><br/>
      Nous avons examiné votre dossier avec attention. Après analyse, nous ne sommes pas en mesure de donner suite à votre candidature à ce stade.<br/><br/>
      CROCHET est une infrastructure privée à accès restreint. Nos critères d'admission évoluent en fonction du réseau et des opportunités actives.
    </p>
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E0DAD0;font-size:10px;color:#7A746E;letter-spacing:0.08em;text-transform:uppercase;">
      NDA-CROCHET-V1 · Confidentiel · Droit français
    </div>
  </div>
</body>
</html>`,
      }),
    }).catch(() => {});
  }

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

export async function setVerificationStatus(
  userId: string,
  status: "unverified" | "pending" | "verified"
) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("investor_profiles")
    .update({ verification_status: status })
    .eq("user_id", userId);

  revalidatePath("/app/admin");
}

export async function runAiAnalysis(ids: string[]) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("admission_requests")
    .select("id, name, email, role, linkedin, city, siret, ticket, message")
    .in("id", ids);

  if (!rows?.length) return;

  await Promise.allSettled(
    rows.map(async (req) => {
      try {
        const { score, note } = await analyzeAdmission(req);
        await admin
          .from("admission_requests")
          .update({ ai_score: score, ai_note: note })
          .eq("id", req.id);
      } catch {
        // silently skip if AI fails for one request
      }
    })
  );
}
