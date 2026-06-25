import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const accessToken = req.cookies.get("sb-access-token")?.value;
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;

  // Consider the user authenticated if a session cookie exists. A refresh
  // token alone is enough to recover a session on the client/server pages.
  if (!accessToken && !refreshToken) {
    return false;
  }

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) return true;
  }

  // Access token missing/expired but a refresh token is present → treat as
  // authenticated and let the page handle the refresh. Avoids false logouts.
  return !!refreshToken;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Silent protection only: block unauthenticated access to protected routes.
  const authed = await isAuthenticated(req);

  if (!authed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/moderator/:path*",
    "/marketplace/post",
    "/poste-annonce",
  ],
};
