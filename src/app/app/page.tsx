import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-10">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900">Logged in</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Logout
            </button>
          </form>
        </div>
        <p className="mt-4 text-sm text-zinc-600">
          Email: <span className="font-medium text-zinc-900">{user.email ?? "No email"}</span>
        </p>
      </div>
    </div>
  );
}
