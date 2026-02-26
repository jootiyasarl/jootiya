import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { platform, user_agent } = await request.json();
        const supabase = createSupabaseServerClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('install_logs')
            .insert({
                user_id: user?.id || null,
                platform: platform,
                user_agent: user_agent
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Log install error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
