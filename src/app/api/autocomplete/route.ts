import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        // Validate query parameter
        if (!query || query.trim().length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        const supabase = createSupabaseServerClient();

        // Call the autocomplete function
        const { data, error } = await supabase
            .rpc('autocomplete_ads', {
                search_prefix: query.trim(),
                result_limit: 5
            });

        if (error) {
            console.error('Autocomplete error:', error);
            return NextResponse.json({ suggestions: [] }, { status: 500 });
        }

        return NextResponse.json({ suggestions: data || [] });
    } catch (error) {
        console.error('Autocomplete API error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
