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
      const user = data.session.user;
      const cookieStore = await cookies();
      const secure = process.env.NODE_ENV === "production";
      
      // Keep users permanently logged in (20 years)
      const TWENTY_YEARS = 60 * 60 * 24 * 365 * 20;

      // Set access token
      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: TWENTY_YEARS,
      });

      // Set refresh token
      if (data.session.refresh_token) {
        cookieStore.set("sb-refresh-token", data.session.refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          maxAge: TWENTY_YEARS,
        });
      }

      // Create or update profile for ALL users
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      });

      const isAdmin = user.email === 'jootiyasarl@gmail.com';
      const role = isAdmin ? 'super_admin' : 'seller';

      const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Profile Upsert Error:', upsertError);
      }

      // Handle redirect destination
      const redirectTarget = requestUrl.searchParams.get("redirect") || "/marketplace";

      if (isAdmin) {
        return NextResponse.redirect(`${requestUrl.origin}/admin`);
      }

      return NextResponse.redirect(`${requestUrl.origin}${redirectTarget}`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
