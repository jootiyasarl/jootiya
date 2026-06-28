import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  setAuthSession,
  setSellerSession,
} from "@/lib/supabase-server";

/**
 * Server-side OAuth callback for Google/Gmail login.
 *
 * Flow:
 * 1. Supabase redirects the browser here with a `code` after Google auth.
 * 2. The server exchanges the `code` for a real session (access + refresh tokens).
 * 3. We look up/create the user's profile and determine their role.
 * 4. We store two sets of cookies:
 *    - `sb-access-token` / `sb-refresh-token` for the existing Supabase helpers.
 *    - `session_token` / `user_role` for the middleware-based seller protection.
 * 5. Finally we redirect the user to the appropriate destination:
 *    - admin  → `/admin`
 *    - seller → `/seller/dashboard` (or the requested `redirectTo`)
 */

const ADMIN_EMAIL = "jootiyasarl@gmail.com";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(requestUrl.origin);
  }

  const supabase = createSupabaseServerClient();

  // 1. Exchange the OAuth code for a session.
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    console.error("OAuth callback error:", error?.message);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`);
  }

  const session = data.session;
  const user = session.user;

  // 2. Decide the role and make sure a profile row exists.
  const isAdmin = user.email === ADMIN_EMAIL;
  const role = isAdmin ? "admin" : "seller";
  await ensureProfile(user, role);

  // 3. Persist the session in HTTP-only cookies.
  await setAuthSession(session); // legacy Supabase cookies
  await setSellerSession(session, role); // cookies the middleware reads

  // 4. Determine the final destination via `next` (only allow relative paths).
  const next = requestUrl.searchParams.get("next");
  const safeRedirectTo =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : isAdmin
        ? "/admin"
        : "/dashboard";

  // 5. Build redirect response and set cookies directly on it to avoid any edge/runtime mismatch.
  const res = NextResponse.redirect(`${requestUrl.origin}${safeRedirectTo}`);

  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd ? ".jootiya.com" : undefined;
  const common = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd ? true : false,
    path: "/",
    domain,
  };

  // Supabase session cookies
  res.cookies.set("sb-access-token", session.access_token, {
    ...common,
    maxAge: session.expires_in ?? 60 * 60,
  });
  if (session.refresh_token) {
    res.cookies.set("sb-refresh-token", session.refresh_token, {
      ...common,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // Middleware cookies
  res.cookies.set("session_token", session.access_token, {
    ...common,
    maxAge: session.expires_in ?? 60 * 60,
  });
  res.cookies.set("user_role", role, {
    ...common,
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}

/**
 * Ensure the user has a `profiles` row so the seller pages can load the user data.
 * We only insert if the row does not exist, so we never overwrite existing roles.
 */
async function ensureProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, role: "admin" | "seller") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return;

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata ?? {};
  const fullName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (user.email ? user.email.split("@")[0] : "Vendeur");
  const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || null;

  await admin.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role,
    updated_at: new Date().toISOString(),
  });
}
