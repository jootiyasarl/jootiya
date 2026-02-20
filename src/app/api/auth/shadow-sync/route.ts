import { createClient } from '@supabase/supabase-js';

// Helper to get admin client safely during build
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(req: Request) {
  try {
    const { session, buffer, guestId, tags } = await req.json();
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), { status: 500 });
    }

    // 1. Sync Behavior Buffer
    if (buffer && buffer.length > 0) {
      const behaviorData = buffer.map((event: any) => ({
        user_id: userId,
        guest_id: guestId,
        event_type: event.type,
        ad_id: event.adId,
        category: event.category,
        query: event.query,
        duration: event.duration,
        created_at: event.timestamp
      }));

      await supabaseAdmin.from('user_behavior').insert(behaviorData);
    }

    // 2. Sync Interests/Tags to Profile
    if (tags && tags.length > 0) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('profiling_tags')
        .eq('id', userId)
        .single();

      const existingTags = profile?.profiling_tags || [];
      const newTags = Array.from(new Set([...existingTags, ...tags]));

      await supabaseAdmin
        .from('profiles')
        .update({ profiling_tags: newTags })
        .eq('id', userId);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Shadow Sync Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
