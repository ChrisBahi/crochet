import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type CheckResult = {
  ok: boolean
  latency_ms?: number
  error?: string
}

async function checkSupabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("workspaces").select("id").limit(1)
    if (error) return { ok: false, error: error.message }
    return { ok: true, latency_ms: Date.now() - start }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function checkEnv(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
  ]
  const missing = required.filter(k => !process.env[k])
  if (missing.length > 0) {
    return { ok: false, error: `Variables manquantes : ${missing.join(", ")}` }
  }
  return { ok: true }
}

export async function GET() {
  const [supabase, env] = await Promise.all([
    checkSupabase(),
    Promise.resolve(checkEnv()),
  ])

  const allOk = supabase.ok && env.ok

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { supabase, env },
    },
    { status: allOk ? 200 : 503 }
  )
}
