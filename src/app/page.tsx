import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./home-client";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

  const appHref = session ? "/app" : "/login";

  return <HomeClient appHref={appHref} />;
}
