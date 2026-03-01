import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MatchesPage() {

  const supabase = await createClient()

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("score", { ascending: false })

  if (!matches) {
    return <div style={{ padding: 40 }}>No matches</div>
  }

  const opportunityIds = [
    ...new Set([
      ...matches.map(m => m.opportunity_a),
      ...matches.map(m => m.opportunity_b)
    ])
  ]

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .in("id", opportunityIds)

  const opportunityMap = Object.fromEntries(
    opportunities?.map(o => [o.id, o]) || []
  )

  async function createRoomFromMatch(matchId: string, workspaceId: string) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // créer la room (1 par match)
    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        match_id: matchId,
        workspace_id: workspaceId,
        created_by: user.id
      })
      .select("id")
      .single()

    // si déjà existe (unique match) => on va la récupérer
    if (error) {
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("match_id", matchId)
        .single()

      if (existing?.id) redirect(`/app/rooms/${existing.id}`)
      throw new Error(error.message)
    }

    redirect(`/app/rooms/${room.id}`)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Matches</h1>

      {matches.map((m) => {

        const a = opportunityMap[m.opportunity_a]
        const b = opportunityMap[m.opportunity_b]

        return (
          <div
            key={m.id}
            style={{
              border: "1px solid #ddd",
              padding: 20,
              borderRadius: 8,
              marginTop: 20
            }}
          >

            <h3>{a?.title}</h3>
            <p>{a?.description}</p>

            <hr style={{ margin: "10px 0" }} />

            <h3>{b?.title}</h3>
            <p>{b?.description}</p>
            <div className="text-sm text-gray-500">
              Score: {m.score}
            </div>

            <div className="text-xs text-gray-400">
              {m.reason}
            </div>

            <form
              action={async () => {
                "use server"
                await createRoomFromMatch(m.id, m.workspace_id)
              }}
            >
              <button style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", marginTop: 10 }}>
                Create Room
              </button>
            </form>

          </div>
        )
      })}
    </div>
  )
}
