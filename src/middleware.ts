import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get admin client safely
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
};

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const adId = url.pathname.split('/ads/')[1]?.split('/')[0];

  // 1. Admin Protection Logic
  if (url.pathname.startsWith('/admin')) {
    const allCookies = request.cookies.getAll();
    // Log cookie names for debugging (can be seen in server logs)
    const cookieNames = allCookies.map(c => c.name);
    
    // Look for ANY supabase auth token
    const supabaseToken = allCookies.find(c => c.name.includes('auth-token'))?.value || 
                          request.cookies.get('sb-access-token')?.value ||
                          request.cookies.get('supabase-auth-token')?.value;

    if (!supabaseToken) {
      console.log('Middleware: No token found for /admin. Cookies present:', cookieNames);
      return NextResponse.redirect(new URL('/master-access', request.url));
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseToken);
        
        if (error || !user) {
          console.error('Middleware: Auth error or no user for /admin', error);
          return NextResponse.redirect(new URL('/master-access', request.url));
        }

        // Fetch profile to verify admin role
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role, phone, email')
          .eq('id', user.id)
          .single();

        const isSuperAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
        const isAuthorizedEmail = user.email === 'jootiyasarl@gmail.com' || profile?.email === 'jootiyasarl@gmail.com';
        const isAuthorizedPhone = profile?.phone === '0618112646';

        // IF AUTHORIZED ADMIN, ALLOW ACCESS
        if (isAuthorizedEmail || isSuperAdmin || isAuthorizedPhone) {
          return NextResponse.next();
        }

        console.warn('Middleware: Unauthorized access attempt by', user.email);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (e) {
        return NextResponse.redirect(new URL('/master-access', request.url));
      }
    }
  }

  // 2. User Dashboard Protection Logic
  if (url.pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Viral Anti-Cheat: Behavioral Analysis
  if (ref && adId && adId.length === 36) {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (supabaseAdmin) {
      const now = Date.now();
      const { data: recentActivity } = await supabaseAdmin
        .from('referrals')
        .select('created_at')
        .eq('referrer_id', ref)
        .gt('created_at', new Date(now - 10000).toISOString());

      if (recentActivity && recentActivity.length >= 5) {
        await supabaseAdmin.rpc('increment_viral_flag', { target_user_id: ref });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ads/:id*', '/admin/:path*', '/dashboard/:path*'],
};