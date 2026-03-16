import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: runs every day at 10:00 UTC
// Config in vercel.json
export const maxDuration = 120;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// ── Email templates ───────────────────────────────────────────

type DripStep = "j1" | "j3" | "j7";

function buildEmail(tunnel: string, step: DripStep, firstName: string): {
  subject: string;
  html: string;
} {
  const content = DRIP_CONTENT[tunnel]?.[step] ?? DRIP_CONTENT["default"][step];
  const { subject, headline, body, cta, ctaLabel } = content;

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · ${step === "j1" ? "Premiers pas" : step === "j3" ? "Relance J+3" : "Offre essai"}
    </div>
    <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;color:#0A0A0A;">${headline}</h2>
    <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
    <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">${body}</p>
    <a href="${APP_URL}${cta}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
      ${ctaLabel}
    </a>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E0DAD0;font-size:10px;color:#7A746E;letter-spacing:0.08em;text-transform:uppercase;">
      NDA-CROCHET-V1 · Confidentiel · Droit français
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

const DRIP_CONTENT: Record<string, Record<DripStep, {
  subject: string; headline: string; body: string; cta: string; ctaLabel: string;
}>> = {
  cedant: {
    j1: {
      subject: "Votre dossier CROCHET vous attend",
      headline: "Une chose à faire aujourd'hui.",
      body: "Votre accès est actif. La première étape pour une cession réussie : déposer votre dossier confidentiel. En moins de 60 secondes, le moteur génère votre MÉMO et votre D-Score — le seul document que vous partagerez avec les repreneurs.",
      cta: "/app/opportunities",
      ctaLabel: "Soumettre mon dossier →",
    },
    j3: {
      subject: "Votre dossier n'est pas encore soumis",
      headline: "3 jours, toujours pas de dossier.",
      body: "Pas de jugement — mais chaque jour sans dossier, c'est un repreneur qualifié de moins qui pourrait vous faire une offre. Le processus prend 3 minutes. Votre identité reste confidentielle jusqu'au NDA signé.",
      cta: "/app/opportunities",
      ctaLabel: "Déposer mon dossier maintenant →",
    },
    j7: {
      subject: "Votre essai CROCHET — 7 jours déjà",
      headline: "7 jours. Votre dossier mérite mieux.",
      body: "Votre essai est actif depuis une semaine. Les cédants qui ont soumis leur dossier dans les 7 premiers jours ont reçu en moyenne 3 matches qualifiés en moins de 14 jours. Ne laissez pas votre dossier sans acheteurs potentiels.",
      cta: "/app/billing",
      ctaLabel: "Activer mon accès complet →",
    },
  },
  repreneur: {
    j1: {
      subject: "Configurez vos critères — c'est 2 minutes",
      headline: "Votre deal flow commence ici.",
      body: "Votre accès est actif. Pour recevoir des dossiers pertinents, renseignez vos critères d'acquisition : secteur, taille d'entreprise, zone géographique, ticket cible. Le moteur IA fait le reste — vous ne voyez que ce qui correspond.",
      cta: "/app/profile",
      ctaLabel: "Configurer mes critères →",
    },
    j3: {
      subject: "Vos critères ne sont pas encore renseignés",
      headline: "Sans critères, pas de matches.",
      body: "3 jours depuis votre accès, et le moteur n'a pas encore vos préférences. Résultat : des dossiers qui correspondent peut-être à votre profil passent sans vous être présentés. 2 minutes pour configurer, des mois de prospection évités.",
      cta: "/app/profile",
      ctaLabel: "Renseigner mes critères →",
    },
    j7: {
      subject: "Des dossiers de cession vous attendent",
      headline: "Le marché ne vous attend pas.",
      body: "Les meilleures opportunités de reprise se closent en 4 à 8 semaines. Votre essai CROCHET vous donne accès à un flux qualifié, confidentiel, analysé par IA. Passez en accès complet pour ne manquer aucun deal.",
      cta: "/app/billing",
      ctaLabel: "Voir les plans →",
    },
  },
  fonds: {
    j1: {
      subject: "Votre pipeline M&A PME est actif",
      headline: "Complétez votre profil investisseur.",
      body: "Votre accès fonds est activé. Pour recevoir un deal flow qualifié et pertinent, renseignez vos paramètres : tickets cibles, secteurs prioritaires, géographies. Le moteur IA score chaque dossier avant de vous le présenter.",
      cta: "/app/profile",
      ctaLabel: "Compléter mon profil →",
    },
    j3: {
      subject: "Votre profil investisseur est incomplet",
      headline: "Sans profil, pas de deal flow.",
      body: "3 jours depuis votre accès. Sans vos critères d'investissement, le moteur ne peut pas vous matcher avec les dossiers entrants. Chaque semaine, de nouvelles cessions PME (500k–5M€) sont analysées — configurez votre profil pour les recevoir.",
      cta: "/app/profile",
      ctaLabel: "Configurer mon profil →",
    },
    j7: {
      subject: "Votre pipeline CROCHET — bilan J+7",
      headline: "Des dossiers PME vous ont échappé.",
      body: "Cette semaine, le moteur a analysé de nouveaux dossiers de cession. Votre profil incomplet vous en a privé. Activez votre accès complet : NDA automatique, scoring IA, rooms de négociation sécurisées — tout ce qu'un fonds sérieux attend.",
      cta: "/app/billing",
      ctaLabel: "Activer l'accès complet →",
    },
  },
  default: {
    j1: {
      subject: "Votre accès CROCHET — première étape",
      headline: "Bienvenue dans le réseau.",
      body: "Votre accès est actif. Complétez votre profil pour que le moteur IA puisse vous matcher avec les meilleures opportunités du réseau.",
      cta: "/app/profile",
      ctaLabel: "Compléter mon profil →",
    },
    j3: {
      subject: "CROCHET — votre profil est incomplet",
      headline: "Pas encore configuré ?",
      body: "3 jours depuis votre accès. Sans profil complet, le moteur de matching ne peut pas travailler pour vous. Prenez 2 minutes pour renseigner vos informations.",
      cta: "/app/profile",
      ctaLabel: "Compléter maintenant →",
    },
    j7: {
      subject: "Votre essai CROCHET — dernière semaine",
      headline: "Une semaine d'essai déjà.",
      body: "Votre période d'essai avance. Passez à un accès complet pour continuer à accéder aux opportunités, matches et rooms de négociation du réseau.",
      cta: "/app/billing",
      ctaLabel: "Voir les plans →",
    },
  },
};

// ── Cron handler ─────────────────────────────────────────────

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // Fetch all active trial subscriptions with drip state
  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("user_id, created_at, drip_j1_sent_at, drip_j3_sent_at, drip_j7_sent_at")
    .eq("plan", "trial")
    .eq("status", "active");

  if (error) {
    console.error("[drip] fetch subscriptions failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const results: string[] = [];

  for (const sub of subs ?? []) {
    const createdAt = new Date(sub.created_at);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Determine which step to send (send only one per run, in priority order)
    let stepToSend: DripStep | null = null;
    if (hoursElapsed >= 20 && hoursElapsed < 52 && !sub.drip_j1_sent_at) {
      stepToSend = "j1";
    } else if (hoursElapsed >= 68 && hoursElapsed < 100 && !sub.drip_j3_sent_at) {
      stepToSend = "j3";
    } else if (hoursElapsed >= 164 && hoursElapsed < 196 && !sub.drip_j7_sent_at) {
      stepToSend = "j7";
    }

    if (!stepToSend) continue;

    // Get user email + tunnel from auth.users metadata
    const { data: authUser } = await supabase.auth.admin.getUserById(sub.user_id);
    const email = authUser?.user?.email;
    if (!email) continue;

    const meta = (authUser?.user?.user_metadata ?? {}) as { full_name?: string; tunnel?: string };
    const firstName = (meta?.full_name ?? email).split(" ")[0];
    let tunnel = meta?.tunnel ?? "";

    // Fallback: get tunnel from admission_requests if not in metadata
    if (!tunnel) {
      const { data: req } = await supabase
        .from("admission_requests")
        .select("tunnel")
        .eq("email", email)
        .eq("status", "approved")
        .single();
      tunnel = req?.tunnel ?? "";
    }

    if (!process.env.RESEND_API_KEY) continue;

    const { subject, html } = buildEmail(tunnel, stepToSend, firstName);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CROCHET <support@crochett.ai>",
        to: [email],
        subject,
        html,
      }),
    }).catch(() => null);

    if (resendRes?.ok) {
      const col = `drip_${stepToSend}_sent_at` as
        | "drip_j1_sent_at"
        | "drip_j3_sent_at"
        | "drip_j7_sent_at";
      await supabase
        .from("subscriptions")
        .update({ [col]: now.toISOString() })
        .eq("user_id", sub.user_id);

      sent++;
      results.push(`${email} → ${stepToSend} (tunnel: ${tunnel || "default"})`);
    }
  }

  console.log("[drip] done:", { sent, results });
  return NextResponse.json({ success: true, sent, details: results });
}
