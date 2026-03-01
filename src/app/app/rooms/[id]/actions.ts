"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendMessage(roomId: string, content: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("unauthorized");

  const text = content.trim();
  if (!text) throw new Error("empty");

  const { error } = await supabase.from("messages").insert({
    room_id: roomId,
    sender_id: auth.user.id,
    created_by: auth.user.id,
    content: text,
  });

  if (error) throw new Error(error.message);
}
