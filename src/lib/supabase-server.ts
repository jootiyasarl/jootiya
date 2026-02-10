import { cookies } from "next/headers";
import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
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
    const accessToken = cookieStore.get("sb-access-token")?.value;

    const options: any = {
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
    const secure = process.env.NODE_ENV === "production";
    const accessTokenMaxAge = session.expires_in ?? 60 * 60;

    cookieStore.set("sb-access-token", session.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: accessTokenMaxAge,
    });

    if (session.refresh_token) {
        cookieStore.set("sb-refresh-token", session.refresh_token, {
            httpOnly: true,
            sameSite: "lax",
            secure,
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
    }
}

export async function clearAuthSession() {
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === "production";

    cookieStore.set("sb-access-token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 0,
    });

    cookieStore.set("sb-refresh-token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 0,
    });
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
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
        return null;
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
        return null;
    }

    return data.user;
}
