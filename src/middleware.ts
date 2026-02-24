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
    // جلب جميع الكوكيز للبحث عن التوكن الصحيح
    const allCookies = request.cookies.getAll();
    const supabaseToken = allCookies.find(c => c.name.includes('-auth-token'))?.value || request.cookies.get('sb-access-token')?.value;

    if (!supabaseToken) {
      console.log('Middleware: No Supabase token found');
      return NextResponse.redirect(new URL('/master-access', request.url));
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        // استخدام getUser يضمن أن التوكن صحيح وغير مزور
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseToken);
        
        if (error || !user) {
          return NextResponse.redirect(new URL('/master-access', request.url));
        }

        // التحقق الصارم من الإيميل
        if (user.email === 'jootiyasarl@gmail.com') {
          return NextResponse.next();
        }

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