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

type Role = "buyer" | "seller" | "admin" | "moderator";

function getUserRole(user: User): Role | null {
  const meta = (user.app_metadata as any) ?? {};
  const userMeta = (user.user_metadata as any) ?? {};

  const role = (meta.role ?? userMeta.role) as string | undefined;

  if (!role) return null;

  if (["buyer", "seller", "admin", "moderator"].includes(role)) {
    return role as Role;
  }

  return null;
}

function getRoleHome(role: Role | null): string {
  switch (role) {
    case "seller":
      return "/dashboard";
    case "admin":
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
    pathname.startsWith("/moderator");

  const user = await getUserFromRequest(req);
  const role = user ? getUserRole(user) : null;

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

    // Admin-only area
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(targetForRole, req.url));
    }

    // Moderator-only area
    if (pathname.startsWith("/moderator") && role !== "moderator") {
      return NextResponse.redirect(new URL(targetForRole, req.url));
    }

    // Dashboard is primary for sellers; admins/moderators go to their own area
    if (pathname.startsWith("/dashboard")) {
      if (role === "admin" || role === "moderator") {
        return NextResponse.redirect(new URL(targetForRole, req.url));
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
  ],
};
