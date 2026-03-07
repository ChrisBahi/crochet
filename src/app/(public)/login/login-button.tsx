"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const supabase = createClient();

  const onLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={onLogin}
      className="w-full rounded-xl bg-[#0A66C2] text-white px-4 py-2 font-medium hover:bg-[#0A66C2]/90"
    >
      Continuer avec LinkedIn
    </button>
  );
}
