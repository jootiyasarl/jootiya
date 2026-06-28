import "server-only";

import { cookies } from "next/headers";
import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
}

function resolveCookieOptions(maxAge: number) {
    const isProd = process.env.NODE_ENV === "production";
    // Share session across apex and www by scoping to the root domain in prod.
    const domain = isProd ? ".jootiya.com" : undefined;
    return {
        httpOnly: true as const,
        sameSite: "lax" as const,
        secure: isProd ? true : false,
        path: "/",
        maxAge,
        domain,
    };
}

export type UserRole = "seller" | "admin" | "super_admin";

export function createSupabaseServerClient() {
    return createClient(supabaseUrl as string, supabaseAnonKey as string, {
        auth: {
            persistSession: false,
        },
    });
}

export async function getAuthenticatedServerClient() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value
        || cookieStore.get("session_token")?.value;

    const options: {
        auth: { persistSession: false };
        global?: { headers: { Authorization: string } };
    } = {
        auth: {
            persistSession: false,
        },
    };

    if (accessToken) {
        options.global = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
    }

    return createClient(supabaseUrl as string, supabaseAnonKey as string, options);
}

export async function setAuthSession(session: Session) {
    const cookieStore = await cookies();
    const accessTokenMaxAge = session.expires_in ?? 60 * 60;

    cookieStore.set("sb-access-token", session.access_token, resolveCookieOptions(accessTokenMaxAge));

    if (session.refresh_token) {
        cookieStore.set("sb-refresh-token", session.refresh_token, resolveCookieOptions(60 * 60 * 24 * 30));
    }
}

export async function setSellerSession(session: Session, role: "seller" | "admin") {
    const cookieStore = await cookies();

    // `session_token` is the token the middleware checks for protected routes.
    cookieStore.set("session_token", session.access_token, resolveCookieOptions(session.expires_in ?? 60 * 60));

    // `user_role` allows the middleware to distinguish sellers from other users.
    cookieStore.set("user_role", role, resolveCookieOptions(60 * 60 * 24 * 30));
}

export async function clearAuthSession() {
    const cookieStore = await cookies();

    cookieStore.set("sb-access-token", "", resolveCookieOptions(0));

    cookieStore.set("sb-refresh-token", "", resolveCookieOptions(0));

    cookieStore.set("session_token", "", resolveCookieOptions(0));

    cookieStore.set("user_role", "", resolveCookieOptions(0));
}

export async function getProfileRole(userId: string): Promise<UserRole | null> {
    const supabase = createSupabaseServerClient();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error || !profile?.role) {
        return null;
    }

    const role = String(profile.role).trim();

    if (role === "seller" || role === "admin" || role === "super_admin") {
        return role;
    }

    return null;
}

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value
        || cookieStore.get("session_token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // Try the current access token first using an authenticated server client
    if (accessToken) {
        const authed = createClient(supabaseUrl as string, supabaseAnonKey as string, {
            auth: { persistSession: false },
            global: { headers: { Authorization: `Bearer ${accessToken}` } },
        });
        const { data, error } = await authed.auth.getUser();
        if (!error && data.user) {
            return data.user;
        }
    }

    // If the access token is missing or expired, try to refresh the session
    if (refreshToken) {
        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (!error && data.session) {
            await setAuthSession(data.session);
            return data.session.user;
        }
    }

    return null;
}
