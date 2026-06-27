import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Seller Authentication Middleware
 *
 * Flow:
 * 1. Read the auth cookies sent by the browser on every request.
 *    - `session_token`: the active Supabase access token (set after login).
 *    - `user_role`: the role of the logged-in user (must be "seller").
 * 2. If the request targets a `/seller/*` route, verify the seller is authenticated.
 *    - Missing or invalid cookies → redirect to `/login` (with the intended URL).
 * 3. If an authenticated seller accidentally visits `/login` or `/register`,
 *    redirect them immediately to `/seller/dashboard`.
 * 4. Public routes (home, marketplace, etc.) are left untouched.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Read the auth cookies from the incoming request.
  const sessionToken = request.cookies.get("session_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // A seller is considered authenticated only if both cookies exist and match.
  const isAuthenticatedSeller = Boolean(sessionToken && userRole === "seller");

  // 2. Protect all seller routes.
  if (pathname.startsWith("/seller")) {
    if (!isAuthenticatedSeller) {
      // Build the login URL and remember where the user wanted to go.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Seller is authenticated → allow the request.
    return NextResponse.next();
  }

  // 3. Redirect logged-in sellers away from the login/register pages.
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticatedSeller) {
      return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    }
  }

  // 4. Let every other route pass through (public pages, API routes, etc.).
  return NextResponse.next();
}

// Match only the routes we need to guard or redirect.
export const config = {
  matcher: ["/seller/:path*", "/login", "/register"],
};
