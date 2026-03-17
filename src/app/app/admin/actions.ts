"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeAdmission } from "@/lib/admission/analyze";
import { revalidatePath } from "next/cache";

export async function approveAdmission(id: string, email: string, name: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const [, { data: reqData }] = await Promise.all([
    admin.from("admission_requests").update({ status: "approved" }).eq("id", id),
    admin.from("admission_requests").select("role, tunnel").eq("id", id).single(),
  ]);

  const tunnel: string = reqData?.tunnel ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Generate the invite magic link
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data: { full_name: name, tunnel },
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (linkError && !linkError.message.includes("already")) {
    throw new Error(linkError.message);
  }

  const actionLink = (linkData as { properties?: { action_link?: string } } | null)
    ?.properties?.action_link ?? `${siteUrl}/login`;

  const firstName = name?.split(" ")[0] ?? name ?? "Candidat";

  // ── Email content per tunnel ─────────────────────────────────
  type TunnelContent = { subject: string; headline: string; body: string; hint: string; cta: string };

  const tunnelContent: Record<string, TunnelContent> = {
    cedant: {
      subject: "Votre dossier CROCHET est ouvert",
      headline: "Votre dossier est prêt à être soumis.",
      body: `Votre candidature a été examinée et retenue. En tant que cédant, vous accédez à un réseau privé de repreneurs et d'investisseurs sélectionnés — sans que votre nom ou votre entreprise ne soit jamais exposé publiquement.`,
      hint: `Votre première action : déposez votre dossier de cession. En moins de 60 secondes, le moteur IA génère votre MÉMO confidentiel et votre D-Score — le seul document que vous aurez à partager.`,
      cta: "Soumettre mon dossier →",
    },
    repreneur: {
      subject: "Votre accès CROCHET est activé",
      headline: "Votre deal flow commence maintenant.",
      body: `Votre candidature a été examinée et retenue. En tant que repreneur, vous accédez à un flux qualifié de dossiers de cession — analysés par IA, scorés, et présentés selon vos critères exacts.`,
      hint: `Votre première action : renseignez vos critères d'acquisition (secteur, taille, géo, ticket). Le moteur génère vos premiers matches dès la semaine suivante.`,
      cta: "Configurer mes critères →",
    },
    fonds: {
      subject: "Votre pipeline CROCHET est activé",
      headline: "Votre deal flow M&A PME est prêt.",
      body: `Votre accès a été validé. En tant que fonds ou family office, vous accédez à un pipeline de cessions PME qualifiées par IA — avec NDA automatique, scoring structuré, et rooms de négociation sécurisées.`,
      hint: `Votre première action : complétez votre profil investisseur (tickets, secteurs, géographies). Le moteur match en continu et vous notifie à chaque nouvelle opportunité pertinente.`,
      cta: "Accéder à mon pipeline →",
    },
  };

  const content: TunnelContent = tunnelContent[tunnel] ?? {
    subject: "Votre accès CROCHET est confirmé",
    headline: "Votre admission est validée.",
    body: `Votre profil a été examiné et retenu. Vous faites désormais partie de l'infrastructure privée CROCHET — réservée aux professionnels sérieux du marché privé.`,
    hint: `Votre première action : complétez votre profil pour recevoir vos premiers matches.`,
    cta: "Accéder à la plateforme →",
  };

  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CROCHET <contact@crochett.ai>",
        to: [email],
        subject: content.subject,
        html: `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · Accès confirmé
    </div>
    <h2 style="font-size:28px;font-weight:700;font-style:italic;margin:0 0 20px;line-height:1.2;color:#0A0A0A;">${content.headline}</h2>
    <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
    <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">${content.body}</p>
    <div style="background:#F5F2EE;border-left:3px solid #0A0A0A;padding:20px 24px;margin-bottom:28px;">
      <p style="font-size:13px;color:#5A5450;line-height:1.7;margin:0;">${content.hint}</p>
    </div>
    <a href="${actionLink}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;padding:16px 36px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
      ${content.cta}
    </a>
    <p style="font-size:12px;color:#B0AA9E;line-height:1.6;margin:0;">
      Ce lien est à usage unique. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
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
        from: "CROCHET <contact@crochett.ai>",
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

export async function runMatchEngine(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  await requireAdmin();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const secret = process.env.MATCH_ENGINE_SECRET ?? "";

  const res = await fetch(`${baseUrl}/api/match/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { success: false, message: `Erreur ${res.status}: ${text}` };
  }

  const data = await res.json();
  revalidatePath("/app/admin");
  return {
    success: true,
    message: `${data.matches_created ?? 0} match(s) créé(s) sur ${data.opportunities_scanned ?? 0} opportunités analysées.`,
    details: data,
  };
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
