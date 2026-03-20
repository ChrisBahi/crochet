import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "Crochet.",
  description: "Infrastructure privée",
  openGraph: {
    title: "Crochet.",
    description: "Infrastructure privée",
    siteName: "SIGNAL · SCORE · MATCH",
    url: "/",
    images: [],
  },
  twitter: {
    title: "Crochet.",
    description: "Infrastructure privée",
    card: "summary",
    images: [],
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

  const appHref = session ? "/app" : "/login";

  return <HomeClient appHref={appHref} />;
}
