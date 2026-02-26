import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const subscription = await request.json();
        const supabase = createSupabaseServerClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                subscription: subscription,
            }, { onConflict: 'user_id' });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Save subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
