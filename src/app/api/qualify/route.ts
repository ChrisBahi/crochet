import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runQualification } from "@/lib/qualify/run"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 })

  const body = await req.json()
  const { opportunity_id } = body

  if (!opportunity_id) {
    return NextResponse.json({ error: "opportunity_id required" }, { status: 400 })
  }

  try {
    const result = await runQualification(supabase, opportunity_id, { id: user.id, email: user.email ?? undefined })
    return NextResponse.json(result)
  } catch (err) {
    console.error("[qualify]", err)
    return NextResponse.json({ error: "qualification failed" }, { status: 500 })
  }
}
