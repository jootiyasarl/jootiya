import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const cookieStore = await cookies();
      const secure = process.env.NODE_ENV === "production";
      
      // Set access token
      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: data.session.expires_in ?? 3600,
      });

      // Set refresh token
      if (data.session.refresh_token) {
        cookieStore.set("sb-refresh-token", data.session.refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      // Trigger background syncs (Social Miner & Shadow Tracker)
      const baseUrl = requestUrl.origin;
      
      // We use a fire-and-forget fetch to avoid blocking the redirect
      if (data.session.user.app_metadata?.provider === 'google' || data.session.provider_token) {
        fetch(`${baseUrl}/api/auth/social-miner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: data.session })
        }).catch(err => console.error('Callback: Social Miner Trigger Error:', err));
      }

      // Shadow Tracker Sync (Note: In a real callback, localStorage isn't accessible. 
      // This part would usually be handled on the next client-side load or via a middleman page)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
