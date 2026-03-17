import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: runs every Monday at 09:00 UTC (1h after match engine)
// Config in vercel.json
export const maxDuration = 120;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all members with at least 1 new match this week
  const { data: newMatches } = await supabase
    .from("opportunity_matches")
    .select("member_id, fit_score, why, opportunity_id")
    .gte("created_at", since)
    .eq("status", "pending");

  if (!newMatches?.length) {
    return NextResponse.json({ success: true, sent: 0, reason: "no new matches this week" });
  }

  // Group by member_id
  const byMember = new Map<string, typeof newMatches>();
  for (const m of newMatches) {
    if (!m.member_id) continue;
    if (!byMember.has(m.member_id)) byMember.set(m.member_id, []);
    byMember.get(m.member_id)!.push(m);
  }

  let sent = 0;

  for (const [memberId, matches] of byMember.entries()) {
    // Get member email
    const { data: authUser } = await supabase.auth.admin.getUserById(memberId);
    const email = authUser?.user?.email;
    if (!email || !process.env.RESEND_API_KEY) continue;

    const count = matches.length;
    const topMatch = matches.sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))[0];
    const topScore = topMatch?.fit_score ?? 0;

    const matchRows = matches
      .slice(0, 5)
      .map((m) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;font-family:Arial,sans-serif;font-size:13px;color:#0A0A0A;">
            <span style="font-family:monospace;font-size:12px;font-weight:700;color:#2D6A4F;">M-Score ${m.fit_score ?? "—"}</span>
          </td>
          <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F0EBE3;font-family:Arial,sans-serif;font-size:13px;color:#5A5450;line-height:1.5;">
            ${m.why ?? "Nouveau match identifié par le moteur IA."}
          </td>
        </tr>`)
      .join("");

    const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · Digest hebdomadaire
    </div>
    <h2 style="font-size:26px;font-weight:700;font-style:italic;margin:0 0 8px;line-height:1.2;color:#0A0A0A;">
      ${count} nouveau${count > 1 ? "x" : ""} match${count > 1 ? "es" : ""} cette semaine.
    </h2>
    <p style="font-size:13px;color:#7A746E;margin:0 0 28px;">
      Meilleur M-Score : <strong style="color:#2D6A4F;">${topScore}</strong> — le moteur IA a scanné toutes les opportunités actives.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tbody>
        ${matchRows}
      </tbody>
    </table>
    ${count > 5 ? `<p style="font-size:12px;color:#7A746E;margin:0 0 24px;">+ ${count - 5} autre${count - 5 > 1 ? "s" : ""} match${count - 5 > 1 ? "es" : ""} disponible${count - 5 > 1 ? "s" : ""} sur la plateforme.</p>` : ""}
    <a href="${appUrl}/app/matches" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-bottom:28px;">
      Voir mes matches →
    </a>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E0DAD0;font-size:10px;color:#7A746E;letter-spacing:0.08em;text-transform:uppercase;">
      NDA-CROCHET-V1 · Confidentiel · Droit français
    </div>
  </div>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CROCHET <no-reply@crochett.ai>",
        to: [email],
        subject: `${count} nouveau${count > 1 ? "x" : ""} match${count > 1 ? "es" : ""} CROCHET cette semaine`,
        html,
      }),
    }).catch((err) => console.error("[weekly-digest] resend failed:", err));

    sent++;
  }

  return NextResponse.json({ success: true, sent, members_with_matches: byMember.size });
}
