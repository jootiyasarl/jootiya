"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "jootiyasarl@gmail.com";
const ADMIN_PHONE = "0618112646";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userEmail: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  userEmail: null,
  isAdmin: false,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Single source of truth for the client-side Supabase session.
 *
 * Before this provider, DesktopActions / MobileMenu / MobileBottomNav each ran
 * their own getSession() + onAuthStateChange() + profiles query on every page —
 * 3 duplicated auth listeners and 3 profile fetches per visit. Now the session
 * is read once, the auth-state subscription is registered once, and the admin
 * profile is fetched once per user.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Profile is tagged with the userId it belongs to — stale profiles from a
  // previous user are ignored at read time instead of being reset in an effect.
  const [profileResult, setProfileResult] = useState<{
    userId: string;
    data: { role?: string | null; phone?: string | null } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial session + single auth-state subscription
  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setSession(data.session);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch admin profile once per signed-in user
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    supabase
      .from("profiles")
      .select("role, phone")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfileResult({ userId, data: data ?? null });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const profile =
    profileResult && profileResult.userId === userId ? profileResult.data : null;

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const userEmail = user?.email ?? null;
    const isAdmin =
      !!user &&
      (userEmail === ADMIN_EMAIL ||
        profile?.role === "super_admin" ||
        profile?.role === "admin" ||
        profile?.phone === ADMIN_PHONE);
    return { session, user, userEmail, isAdmin, isLoading };
  }, [session, profile, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
