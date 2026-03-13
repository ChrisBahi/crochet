import type { SupabaseClient } from "@supabase/supabase-js"

type CreateNotificationOptions = {
  supabase: SupabaseClient
  userId: string
  workspaceId?: string
  type: string
  title: string
  body?: string
  link?: string
  email?: string
}

export async function createNotification({
  supabase, userId, workspaceId, type, title, body, link, email,
}: CreateNotificationOptions) {
  await supabase.from("notifications").insert({
    user_id: userId,
    workspace_id: workspaceId ?? null,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
  })

  if (email && process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CROCHET <no-reply@crochet.app>",
          to: [email],
          subject: title,
          html: buildEmailHtml(title, body, link),
        }),
      })
    } catch (err) {
      console.error("[notifications] email failed:", err)
    }
  }
}

function buildEmailHtml(title: string, body?: string, link?: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#FDFAF6;font-family:Arial,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DAD0;padding:40px;">
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A746E;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #0A0A0A;">
      CROCHET · Zone Sécurisée
    </div>
    <h2 style="font-size:22px;font-weight:700;font-style:italic;margin:0 0 16px;line-height:1.3;">${title}</h2>
    ${body ? `<p style="font-size:14px;color:#7A746E;line-height:1.75;margin:0 0 24px;">${body}</p>` : ""}
    ${link ? `<a href="${link}" style="display:inline-block;padding:10px 28px;background:#0A0A0A;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Accéder →</a>` : ""}
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E0DAD0;font-size:10px;color:#7A746E;letter-spacing:0.08em;text-transform:uppercase;">
      NDA-CROCHET-V1 · Confidentiel · Droit français
    </div>
  </div>
</body>
</html>`
}
