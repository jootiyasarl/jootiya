import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const adId = url.pathname.split('/ads/')[1]?.split('/')[0];

  // 1. Viral Anti-Cheat: Behavioral Analysis
  if (ref && adId && adId.length === 36) {
    const now = Date.now();
    const cacheKey = `viral_ratelimit_${ref}`;
    
    // In a production environment with Redis (Upstash), we would do:
    // const { count } = await redis.incr(cacheKey);
    // if (count > 5) { flag_user(ref) }
    
    // For now, we use a lightweight approach using Supabase to check recent activity
    const { data: recentActivity } = await supabaseAdmin
      .from('referrals')
      .select('created_at')
      .eq('referrer_id', ref)
      .gt('created_at', new Date(now - 10000).toISOString()); // Last 10 seconds

    if (recentActivity && recentActivity.length >= 5) {
      // 2. Behavioral Flagging: Ghost Ban Logic
      await supabaseAdmin.rpc('increment_viral_flag', { target_user_id: ref });
      
      // We don't block the request, we let the Ghost Ban logic handle it in the DB Trigger
      // This is the "Ghost Ban" - the attacker thinks they are succeeding
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/ads/:id*',
};
