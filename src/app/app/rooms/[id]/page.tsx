// src/app/app/rooms/[id]/page.tsx
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import RoomChat from "@/components/room-chat"

export default async function RoomPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const resolvedParams = await params
  const roomId = resolvedParams?.id
  if (!roomId) throw new Error("Missing room id")

  // 1) room (RLS doit autoriser select si membre)
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, match_id, workspace_id, created_at")
    .eq("id", roomId)
    .single()

  if (roomError) throw new Error(roomError.message)

  // 2) messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  return (
    <div className="p-8">
      <RoomChat roomId={roomId} myUserId={user.id} initialMessages={messages ?? []} />
    </div>
  )
}
