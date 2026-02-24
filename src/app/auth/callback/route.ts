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

      // Check if user is admin and handle redirection/profile creation
      if (user.email === 'jootiyasarl@gmail.com') {
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            persistSession: false,
          },
        });
        
        const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Admin',
          role: 'super_admin',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (upsertError) {
          console.error('Admin Upsert Error:', upsertError);
        }

        return NextResponse.redirect(`${requestUrl.origin}/admin`);
      }

      // Default redirect for other users (if Google is enabled later)
      return NextResponse.redirect(`${requestUrl.origin}/marketplace`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
