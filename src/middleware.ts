import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Service Role is needed for writing referrals from middleware)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const adId = url.pathname.split('/ads/')[1]?.split('/')[0];

  // Only track if we have a referral code and we are on an ad page
  if (ref && adId && adId.length === 36) { // Basic UUID length check
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    
    // Simple fingerprint: IP + UserAgent
    const fingerprint = `${ip}-${ua}`;

    // Fire and forget referral logging to not block the request
    // In production, consider using an Edge Function for better performance
    (async () => {
      try {
        const { error } = await supabaseAdmin
          .from('referrals')
          .insert({
            ad_id: adId,
            referrer_id: ref, // Assuming ref is the user_id of the referrer
            visitor_ip: ip,
            visitor_ua: ua,
            fingerprint: fingerprint
          });
        
        if (error && error.code !== '23505') { // Ignore unique constraint violations (duplicate clicks)
          console.error('Viral Engine Error:', error);
        }
      } catch (e) {
        console.error('Middleware Viral Tracking Exception:', e);
      }
    })();
  }

  return NextResponse.next();
}

// Only run middleware on ad detail pages
export const config = {
  matcher: '/ads/:id*',
};
