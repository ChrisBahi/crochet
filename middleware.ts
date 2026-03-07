import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing. Add it to .env.local`);
  }

  return value;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

  if (!session && req.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && req.nextUrl.pathname.startsWith("/app")) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(session.user.email ?? "");

    if (!isAdmin) {
      const { data } = await supabase
        .from("admission_requests")
        .select("status")
        .eq("email", session.user.email)
        .single();

      if (!data || data.status !== "approved") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*"],
};
