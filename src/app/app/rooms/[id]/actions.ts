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

export async function validateDeal(roomId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("unauthorized");
  const userId = auth.user.id;

  await supabase.from("room_validations").upsert(
    { room_id: roomId, user_id: userId },
    { onConflict: "room_id,user_id", ignoreDuplicates: true }
  );

  const { count } = await supabase
    .from("room_validations")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  if ((count ?? 0) >= 2) {
    await supabase.from("rooms").update({ status: "closed_deal" }).eq("id", roomId);
    await supabase.from("messages").insert({
      room_id: roomId, sender_id: userId, created_by: userId,
      content: "__SYSTEM__: Deal validé par les deux parties. Les documents sont maintenant téléchargeables.",
    });
  } else {
    await supabase.from("rooms").update({ status: "pending_close" }).eq("id", roomId);
    await supabase.from("messages").insert({
      room_id: roomId, sender_id: userId, created_by: userId,
      content: "__SYSTEM__: Une partie a confirmé le deal. En attente de l'autre partie.",
    });
  }
}

export async function declineDeal(roomId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("unauthorized");

  await supabase.from("rooms").update({ status: "closed_no_deal" }).eq("id", roomId);
  await supabase.from("messages").insert({
    room_id: roomId, sender_id: auth.user.id, created_by: auth.user.id,
    content: "__SYSTEM__: Deal décliné. La Room est archivée en lecture seule.",
  });
}

export async function revokeValidation(roomId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("unauthorized");

  await supabase.from("room_validations").delete()
    .eq("room_id", roomId).eq("user_id", auth.user.id);

  const { count } = await supabase
    .from("room_validations")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  if ((count ?? 0) === 0) {
    await supabase.from("rooms").update({ status: "active" }).eq("id", roomId);
  }
}
