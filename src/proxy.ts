import { NextResponse } from 'next/server';
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

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const adId = url.pathname.split('/ads/')[1]?.split('/')[0];

  // 1. Viral Anti-Cheat: Behavioral Analysis
  if (ref && adId && adId.length === 36) {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (supabaseAdmin) {
      const now = Date.now();
      
      // For now, we use a lightweight approach using Supabase to check recent activity
      const { data: recentActivity } = await supabaseAdmin
        .from('referrals')
        .select('created_at')
        .eq('referrer_id', ref)
        .gt('created_at', new Date(now - 10000).toISOString()); // Last 10 seconds

      if (recentActivity && recentActivity.length >= 5) {
        // 2. Behavioral Flagging: Ghost Ban Logic
        await supabaseAdmin.rpc('increment_viral_flag', { target_user_id: ref });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/ads/:id*',
};
