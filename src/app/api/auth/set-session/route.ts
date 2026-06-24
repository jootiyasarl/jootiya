import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { setAuthSession } from "@/lib/supabase-server";

const ADMIN_EMAIL = "jootiyasarl@gmail.com";

async function ensureProfileExists(session: Session) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return;

  const user = session.user;
  if (!user?.id) return;

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Only create a profile if one does not already exist (don't override roles)
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (user.email ? user.email.split("@")[0] : "Utilisateur");
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || null;

  const role = user.email === ADMIN_EMAIL ? "super_admin" : "seller";

  await admin.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role,
    updated_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { session?: Session | null };
    const session = body.session;

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    await setAuthSession(session);

    // Ensure a profiles row exists (seller by default) so dashboard/profile works
    try {
      await ensureProfileExists(session);
    } catch (e) {
      console.error("ensureProfileExists failed", e);
    }

    // Shadow Tracker: Invisible Sync
    const buffer = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('_st_buffer') || '[]') : [];
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('_st_id') : null;
    const tags = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('_st_tags') || '[]') : [];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';

    if (session.user.id) {
      // Sync Shadow Tracker data
      fetch(`${baseUrl}/api/auth/shadow-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, buffer, guestId, tags })
      }).then(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('_st_buffer');
          localStorage.removeItem('_st_tags');
        }
      }).catch(err => console.error('Failed to sync shadow tracker:', err));

      // Trigger Social Data Miner if provider is google
      if (session.user.app_metadata?.provider === 'google' || session.provider_token) {
        fetch(`${baseUrl}/api/auth/social-miner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session })
        }).catch(err => console.error('Failed to trigger social miner:', err));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to set auth session", error);
    return NextResponse.json(
      { error: "Failed to set auth session" },
      { status: 500 },
    );
  }
}
