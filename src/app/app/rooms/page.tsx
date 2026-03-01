import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function RoomsPage() {
  const supabase = await createClient()

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, created_at, match_id")
    .order("created_at", { ascending: false })

  return (
    <div style={{ padding: 40 }}>
      <h1>Rooms</h1>
      <p>Secure rooms for your matches.</p>

      <div style={{ marginTop: 24 }}>
        {(rooms ?? []).length === 0 ? (
          <div style={{ opacity: 0.7 }}>No rooms yet.</div>
        ) : (
          rooms!.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginTop: 12 }}>
              <div style={{ fontWeight: 600 }}>Room</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>match: {r.match_id}</div>
              <div style={{ marginTop: 8 }}>
                <Link href={`/app/rooms/${r.id}`}>Open</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
