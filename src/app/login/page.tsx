"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const loginWithGithub = async () => {
    try {
      setError(null);
      const supabase = createClient();

      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Supabase config missing");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-10">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={loginWithGithub}
          className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}
