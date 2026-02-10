import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { getSellerStats } from '@/lib/db/dashboard';

export async function GET() {
    const user = await getServerUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient();

    try {
        const stats = await getSellerStats(supabase, user.id);
        return NextResponse.json(stats);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
