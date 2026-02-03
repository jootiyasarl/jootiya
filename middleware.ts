import { NextResponse, type NextRequest } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";

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

type Role = "seller" | "admin" | "super_admin" | "moderator" | "buyer";

async function getUserRole(user: User): Promise<Role | null> {
  // 1) Prefer the canonical role stored in the profiles table.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!error && profile?.role) {
    const value = String(profile.role).trim();
    if (
      value === "seller" ||
      value === "admin" ||
      value === "super_admin" ||
      value === "moderator" ||
      value === "buyer"
    ) {
      return value as Role;
    }
  }

  // 2) Backwards-compatible fallback to metadata-based roles.
  const meta = (user.app_metadata as any) ?? {};
  const userMeta = (user.user_metadata as any) ?? {};
  const roleFromMeta = (meta.role ?? userMeta.role) as string | undefined;

  if (!roleFromMeta) return null;

  if (
    roleFromMeta === "seller" ||
    roleFromMeta === "admin" ||
    roleFromMeta === "super_admin" ||
    roleFromMeta === "moderator" ||
    roleFromMeta === "buyer"
  ) {
    return roleFromMeta as Role;
  }

  return null;
}

function getRoleHome(role: Role | null): string {
  switch (role) {
    case "seller":
      return "/dashboard";
    case "admin":
    case "super_admin":
      return "/admin";
    case "moderator":
      return "/moderator";
    default:
      return "/";
  }
}

async function getUserFromRequest(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/moderator") ||
    pathname === "/marketplace/post";

  const user = await getUserFromRequest(req);
  const role = user ? await getUserRole(user) : null;

  // Not logged in → redirect to /login for protected routes
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/login") {
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Logged in user hitting /login or /register → send to role-based home
  if (user && isAuthPage) {
    const target = getRoleHome(role);
    const redirectUrl = new URL(target, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based redirects for logged-in users on protected routes
  if (user && isProtectedRoute) {
    const targetForRole = getRoleHome(role);

    // Admin-only area (admins and super_admins)
    if (
      pathname.startsWith("/admin") &&
      !(role === "admin" || role === "super_admin")
    ) {
      return NextResponse.redirect(new URL(targetForRole, req.url));
    }

    // Moderator-only area
    if (pathname.startsWith("/moderator") && role !== "moderator") {
      return NextResponse.redirect(new URL(targetForRole, req.url));
    }

    // Dashboard is primary for sellers; admins/moderators go to their own area
    if (pathname.startsWith("/dashboard")) {
      if (role !== "seller") {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin/:path*",
    "/moderator/:path*",
    "/marketplace/post",
  ],
};
