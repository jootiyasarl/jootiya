import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Handle both old format (direct subscription) and new format ({subscription, user_id})
        const subscription = body.subscription || body;
        const providedUserId = body.user_id;

        const supabase = createSupabaseServerClient();
        
        // Try to get user from session but don't block if not logged in
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        const finalUserId = user?.id || providedUserId || null;
        
        console.log("Saving subscription for user:", finalUserId);

        const subscriptionData: any = {
            subscription: subscription,
            endpoint: subscription.endpoint,
            user_id: finalUserId,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(subscriptionData, { onConflict: 'endpoint' });

        if (error) {
            console.error("Supabase error saving subscription (upsert):", error);
            // Fallback to simple insert if upsert fails due to schema issues
            const { error: insertError } = await supabase
                .from('push_subscriptions')
                .insert({
                    user_id: finalUserId,
                    subscription: subscription,
                    endpoint: subscription.endpoint
                });
            if (insertError) {
                console.error("Supabase error saving subscription (insert):", insertError);
                throw insertError;
            }
        }

        console.log("Subscription successfully saved in database");
        return NextResponse.json({ success: true, message: "Subscription saved!" });
    } catch (error: any) {
        console.error("Save subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
