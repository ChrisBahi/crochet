import { NextResponse } from "next/server";

// Vercel Cron: runs every Monday at 08:00 UTC
// Config in vercel.json: { "crons": [{ "path": "/api/cron/weekly-match", "schedule": "0 8 * * 1" }] }
export const maxDuration = 300;

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://crochett.ai";
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
    console.error("[cron/weekly-match] match engine failed:", res.status, text);
    return NextResponse.json({ error: `match engine returned ${res.status}` }, { status: 500 });
  }

  const data = await res.json();
  console.log("[cron/weekly-match] done:", data);

  return NextResponse.json({
    success: true,
    ran_at: new Date().toISOString(),
    ...data,
  });
}
