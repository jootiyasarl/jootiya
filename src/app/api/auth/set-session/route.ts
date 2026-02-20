import { NextResponse } from "next/server";
import type { Session } from "@supabase/supabase-js";
import { setAuthSession } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { session?: Session | null };
    const session = body.session;

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    await setAuthSession(session);

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
