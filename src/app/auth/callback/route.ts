import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing. Add it to .env.local`);
  }

  return value;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("oauth_error", error);
    if (errorDescription) {
      loginUrl.searchParams.set("oauth_error_description", errorDescription);
    }
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.redirect(new URL("/welcome", request.url));

  if (code) {
    const supabase = createServerClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("oauth_error", exchangeError.name || "exchange_failed");
      loginUrl.searchParams.set("oauth_error_description", exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("oauth_error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
