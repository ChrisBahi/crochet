"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  room_id: string;
  content: string;
  sender_id: string;
  created_by: string;
  created_at: string;
};

export default function RoomChat({
  roomId,
  myUserId,
  initialMessages,
}: {
  roomId: string;
  myUserId: string;
  initialMessages: Message[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");

  // 🔴 REALTIME
  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  async function sendMessage() {
    const text = content.trim();
    if (!text) return;

    setContent("");

    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      content: text,
      sender_id: myUserId,
      created_by: myUserId,
    });

    if (error) alert(error.message);
  }

  return (
    <div>
      <div style={{ height: 400, overflow: "auto", border: "1px solid #ddd", padding: 16 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <b>{m.sender_id === myUserId ? "Me" : "User"}:</b> {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
