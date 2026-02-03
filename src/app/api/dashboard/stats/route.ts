import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getSellerStats } from '@/lib/db/dashboard';

export async function GET(request: Request) {
    // 1. Secure Route: Check Auth
    // Note: We use getUser() to validate the token on the server
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await getSellerStats(user.id);
        return NextResponse.json(stats);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
