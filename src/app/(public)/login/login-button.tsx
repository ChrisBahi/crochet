"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const supabase = createClient();

  const onLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={onLogin}
      className="w-full rounded-xl bg-white text-black px-4 py-2 font-medium hover:bg-white/90"
    >
      Continuer avec GitHub
    </button>
  );
}
