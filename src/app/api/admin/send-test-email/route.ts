import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crochett.ai";
const FROM_CONTACT = "CROCHET <contact@crochett.ai>";
const FROM_SUPPORT = "CROCHET <support@crochett.ai>";

// ── HTML helpers ─────────────────────────────────────────────

function wrap(header: string, inner: string, from: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · ${header}
    </div>
    ${inner}
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E0DAD0;font-size:10px;color:#7A746E;letter-spacing:0.08em;text-transform:uppercase;">
      NDA-CROCHET-V1 · Confidentiel · Droit français · <em style="text-transform:none;">envoyé depuis ${from}</em>
    </div>
  </div>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">${label}</a>`;
}

// ── Email templates ───────────────────────────────────────────

type EmailType =
  | "approve-cedant"
  | "approve-repreneur"
  | "approve-fonds"
  | "reject"
  | "drip-j1-cedant"
  | "drip-j1-repreneur"
  | "drip-j1-fonds"
  | "drip-j3-cedant"
  | "drip-j3-repreneur"
  | "drip-j3-fonds"
  | "drip-j7-cedant"
  | "drip-j7-repreneur"
  | "drip-j7-fonds"
  | "weekly-digest"
  | "dossier-dscore"
  | "new-match";

function buildTestEmail(type: EmailType, firstName = "Chris"): { subject: string; html: string; from: string } {
  switch (type) {
    // ── APPROVE ──────────────────────────────────────────────────
    case "approve-cedant":
      return {
        from: FROM_CONTACT,
        subject: "Votre dossier CROCHET est ouvert",
        html: wrap("Accès confirmé", `
          <h2 style="font-size:28px;font-weight:700;font-style:italic;margin:0 0 20px;line-height:1.2;">Votre dossier est prêt à être soumis.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre candidature a été examinée et retenue. En tant que cédant, vous accédez à un réseau privé de repreneurs et d'investisseurs sélectionnés — sans que votre nom ou votre entreprise ne soit jamais exposé publiquement.</p>
          <div style="background:#F5F2EE;border-left:3px solid #0A0A0A;padding:20px 24px;margin-bottom:28px;">
            <p style="font-size:13px;color:#5A5450;line-height:1.7;margin:0;">Votre première action : déposez votre dossier de cession. En moins de 60 secondes, le moteur IA génère votre MÉMO confidentiel et votre D-Score — le seul document que vous aurez à partager.</p>
          </div>
          ${btn(`${APP_URL}/app/opportunities`, "Soumettre mon dossier →")}
        `, FROM_CONTACT),
      };

    case "approve-repreneur":
      return {
        from: FROM_CONTACT,
        subject: "Votre accès CROCHET est activé",
        html: wrap("Accès confirmé", `
          <h2 style="font-size:28px;font-weight:700;font-style:italic;margin:0 0 20px;line-height:1.2;">Votre deal flow commence maintenant.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre candidature a été examinée et retenue. En tant que repreneur, vous accédez à un flux qualifié de dossiers de cession — analysés par IA, scorés, et présentés selon vos critères exacts.</p>
          <div style="background:#F5F2EE;border-left:3px solid #0A0A0A;padding:20px 24px;margin-bottom:28px;">
            <p style="font-size:13px;color:#5A5450;line-height:1.7;margin:0;">Votre première action : renseignez vos critères d'acquisition (secteur, taille, géo, ticket). Le moteur génère vos premiers matches dès la semaine suivante.</p>
          </div>
          ${btn(`${APP_URL}/app/profile`, "Configurer mes critères →")}
        `, FROM_CONTACT),
      };

    case "approve-fonds":
      return {
        from: FROM_CONTACT,
        subject: "Votre pipeline CROCHET est activé",
        html: wrap("Accès confirmé", `
          <h2 style="font-size:28px;font-weight:700;font-style:italic;margin:0 0 20px;line-height:1.2;">Votre deal flow M&A PME est prêt.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre accès a été validé. En tant que fonds ou family office, vous accédez à un pipeline de cessions PME qualifiées par IA — avec NDA automatique, scoring structuré, et rooms de négociation sécurisées.</p>
          <div style="background:#F5F2EE;border-left:3px solid #0A0A0A;padding:20px 24px;margin-bottom:28px;">
            <p style="font-size:13px;color:#5A5450;line-height:1.7;margin:0;">Votre première action : complétez votre profil investisseur (tickets, secteurs, géographies). Le moteur match en continu et vous notifie à chaque nouvelle opportunité pertinente.</p>
          </div>
          ${btn(`${APP_URL}/app/profile`, "Accéder à mon pipeline →")}
        `, FROM_CONTACT),
      };

    // ── REJECT ───────────────────────────────────────────────────
    case "reject":
      return {
        from: FROM_CONTACT,
        subject: "Votre candidature CROCHET",
        html: wrap("Zone Sécurisée", `
          <h2 style="font-size:22px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.3;">Suite à votre candidature.</h2>
          <p style="font-size:14px;color:#7A746E;line-height:1.75;margin:0 0 24px;">
            Bonjour ${firstName},<br/><br/>
            Nous avons examiné votre dossier avec attention. Après analyse, nous ne sommes pas en mesure de donner suite à votre candidature à ce stade.<br/><br/>
            CROCHET est une infrastructure privée à accès restreint. Nos critères d'admission évoluent en fonction du réseau et des opportunités actives.
          </p>
        `, FROM_CONTACT),
      };

    // ── DRIP J+1 ─────────────────────────────────────────────────
    case "drip-j1-cedant":
      return {
        from: FROM_SUPPORT,
        subject: "Votre dossier CROCHET vous attend",
        html: wrap("Premiers pas", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Une chose à faire aujourd'hui.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre accès est actif. La première étape pour une cession réussie : déposer votre dossier confidentiel. En moins de 60 secondes, le moteur génère votre MÉMO et votre D-Score — le seul document que vous partagerez avec les repreneurs.</p>
          ${btn(`${APP_URL}/app/opportunities`, "Soumettre mon dossier →")}
        `, FROM_SUPPORT),
      };

    case "drip-j1-repreneur":
      return {
        from: FROM_SUPPORT,
        subject: "Configurez vos critères — c'est 2 minutes",
        html: wrap("Premiers pas", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Votre deal flow commence ici.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre accès est actif. Pour recevoir des dossiers pertinents, renseignez vos critères d'acquisition : secteur, taille d'entreprise, zone géographique, ticket cible. Le moteur IA fait le reste — vous ne voyez que ce qui correspond.</p>
          ${btn(`${APP_URL}/app/profile`, "Configurer mes critères →")}
        `, FROM_SUPPORT),
      };

    case "drip-j1-fonds":
      return {
        from: FROM_SUPPORT,
        subject: "Votre pipeline M&A PME est actif",
        html: wrap("Premiers pas", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Complétez votre profil investisseur.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre accès fonds est activé. Pour recevoir un deal flow qualifié et pertinent, renseignez vos paramètres : tickets cibles, secteurs prioritaires, géographies. Le moteur IA score chaque dossier avant de vous le présenter.</p>
          ${btn(`${APP_URL}/app/profile`, "Compléter mon profil →")}
        `, FROM_SUPPORT),
      };

    // ── DRIP J+3 ─────────────────────────────────────────────────
    case "drip-j3-cedant":
      return {
        from: FROM_SUPPORT,
        subject: "Votre dossier n'est pas encore soumis",
        html: wrap("Relance J+3", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">3 jours, toujours pas de dossier.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Pas de jugement — mais chaque jour sans dossier, c'est un repreneur qualifié de moins qui pourrait vous faire une offre. Le processus prend 3 minutes. Votre identité reste confidentielle jusqu'au NDA signé.</p>
          ${btn(`${APP_URL}/app/opportunities`, "Déposer mon dossier maintenant →")}
        `, FROM_SUPPORT),
      };

    case "drip-j3-repreneur":
      return {
        from: FROM_SUPPORT,
        subject: "Vos critères ne sont pas encore renseignés",
        html: wrap("Relance J+3", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Sans critères, pas de matches.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">3 jours depuis votre accès, et le moteur n'a pas encore vos préférences. Résultat : des dossiers qui correspondent peut-être à votre profil passent sans vous être présentés. 2 minutes pour configurer, des mois de prospection évités.</p>
          ${btn(`${APP_URL}/app/profile`, "Renseigner mes critères →")}
        `, FROM_SUPPORT),
      };

    case "drip-j3-fonds":
      return {
        from: FROM_SUPPORT,
        subject: "Votre profil investisseur est incomplet",
        html: wrap("Relance J+3", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Sans profil, pas de deal flow.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">3 jours depuis votre accès. Sans vos critères d'investissement, le moteur ne peut pas vous matcher avec les dossiers entrants. Chaque semaine, de nouvelles cessions PME (500k–5M€) sont analysées — configurez votre profil pour les recevoir.</p>
          ${btn(`${APP_URL}/app/profile`, "Configurer mon profil →")}
        `, FROM_SUPPORT),
      };

    // ── DRIP J+7 ─────────────────────────────────────────────────
    case "drip-j7-cedant":
      return {
        from: FROM_SUPPORT,
        subject: "Votre essai CROCHET — 7 jours déjà",
        html: wrap("Offre essai", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">7 jours. Votre dossier mérite mieux.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Votre essai est actif depuis une semaine. Les cédants qui ont soumis leur dossier dans les 7 premiers jours ont reçu en moyenne 3 matches qualifiés en moins de 14 jours. Ne laissez pas votre dossier sans acheteurs potentiels.</p>
          ${btn(`${APP_URL}/app/billing`, "Activer mon accès complet →")}
        `, FROM_SUPPORT),
      };

    case "drip-j7-repreneur":
      return {
        from: FROM_SUPPORT,
        subject: "Des dossiers de cession vous attendent",
        html: wrap("Offre essai", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Le marché ne vous attend pas.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Les meilleures opportunités de reprise se closent en 4 à 8 semaines. Votre essai CROCHET vous donne accès à un flux qualifié, confidentiel, analysé par IA. Passez en accès complet pour ne manquer aucun deal.</p>
          ${btn(`${APP_URL}/app/billing`, "Voir les plans →")}
        `, FROM_SUPPORT),
      };

    case "drip-j7-fonds":
      return {
        from: FROM_SUPPORT,
        subject: "Votre pipeline CROCHET — bilan J+7",
        html: wrap("Offre essai", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.25;">Des dossiers PME vous ont échappé.</h2>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 12px;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#5A5450;line-height:1.8;margin:0 0 28px;">Cette semaine, le moteur a analysé de nouveaux dossiers de cession. Votre profil incomplet vous en a privé. Activez votre accès complet : NDA automatique, scoring IA, rooms de négociation sécurisées — tout ce qu'un fonds sérieux attend.</p>
          ${btn(`${APP_URL}/app/billing`, "Activer l'accès complet →")}
        `, FROM_SUPPORT),
      };

    // ── WEEKLY DIGEST ─────────────────────────────────────────────
    case "weekly-digest":
      return {
        from: FROM_SUPPORT,
        subject: "3 nouveaux matches CROCHET cette semaine",
        html: wrap("Digest hebdomadaire", `
          <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 8px;line-height:1.2;">3 nouveaux matches cette semaine.</h2>
          <p style="font-size:13px;color:#7A746E;margin:0 0 28px;">Meilleur M-Score : <strong style="color:#2D6A4F;">82</strong> — le moteur IA a scanné toutes les opportunités actives.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <tbody>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;font-size:13px;color:#0A0A0A;">
                  <span style="font-family:monospace;font-size:12px;font-weight:700;color:#2D6A4F;">M-Score 82</span>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F0EBE3;font-size:13px;color:#5A5450;line-height:1.5;">
                  Cession PME tech SaaS B2B — forte complémentarité stratégique et géographique.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;font-size:13px;color:#0A0A0A;">
                  <span style="font-family:monospace;font-size:12px;font-weight:700;color:#2D6A4F;">M-Score 74</span>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F0EBE3;font-size:13px;color:#5A5450;line-height:1.5;">
                  Activité industrielle rentable en région — profil acquéreur aligné sur les critères définis.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;font-size:13px;color:#0A0A0A;">
                  <span style="font-family:monospace;font-size:12px;font-weight:700;color:#2D6A4F;">M-Score 61</span>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F0EBE3;font-size:13px;color:#5A5450;line-height:1.5;">
                  Réseau de distribution BtoB — complémentarité partielle, à évaluer selon la géographie cible.
                </td>
              </tr>
            </tbody>
          </table>
          ${btn(`${APP_URL}/app/matches`, "Voir mes matches →")}
        `, FROM_SUPPORT),
      };

    // ── DOSSIER QUALIFIÉ D-SCORE ──────────────────────────────────
    case "dossier-dscore":
      return {
        from: FROM_SUPPORT,
        subject: "Dossier qualifié — D-Score 78",
        html: wrap("Zone Sécurisée", `
          <h2 style="font-size:22px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.3;">Dossier qualifié — D-Score 78</h2>
          <p style="font-size:14px;color:#7A746E;line-height:1.75;margin:0 0 24px;">
            Votre dossier a été analysé par le moteur IA. Il obtient un D-Score de <strong style="color:#2D6A4F;">78/100</strong> — dossier solide, bien positionné pour le matching.<br/><br/>
            Le moteur de matching va maintenant comparer votre dossier à l'ensemble du réseau actif.
          </p>
          ${btn(`${APP_URL}/app/opportunities`, "Accéder →")}
        `, FROM_SUPPORT),
      };

    // ── NOUVEAU MATCH ─────────────────────────────────────────────
    case "new-match":
      return {
        from: FROM_SUPPORT,
        subject: "Nouveau match disponible — M-Score 77",
        html: wrap("Zone Sécurisée", `
          <h2 style="font-size:22px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.3;">Nouveau match disponible</h2>
          <p style="font-size:14px;color:#7A746E;line-height:1.75;margin:0 0 24px;">
            Un nouveau match avec un M-Score de <strong style="color:#2D6A4F;">77</strong> vient d'être identifié pour votre dossier.
          </p>
          ${btn(`${APP_URL}/app/matches`, "Accéder →")}
        `, FROM_SUPPORT),
      };
  }
}

// ── Route handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  await requireAdmin();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const { type, to } = await req.json() as { type: EmailType; to: string };

  if (!type || !to) {
    return NextResponse.json({ error: "type and to are required" }, { status: 400 });
  }

  const email = buildTestEmail(type);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: email.from,
      to: [to],
      subject: `[TEST] ${email.subject}`,
      html: email.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return NextResponse.json({ success: true, type, to, subject: email.subject });
}
