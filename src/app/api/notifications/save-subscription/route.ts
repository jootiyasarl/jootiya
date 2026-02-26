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
            updated_at: new Date().toISOString()
        };

        if (finalUserId) {
            subscriptionData.user_id = finalUserId;
        }

        // Using upsert with a unique constraint on subscription endpoint if possible, 
        // or just insert if we want to allow multiple devices per user.
        // For now, let's use the endpoint as a unique identifier to avoid duplicates.
        const endpoint = subscription.endpoint;
        
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: finalUserId,
                subscription: subscription,
                endpoint: endpoint // Assuming we have or add this column for uniqueness
            }, { onConflict: 'endpoint' });

        if (error) {
            console.error("Supabase error saving subscription:", error);
            // Fallback to simple insert if endpoint column doesn't exist yet
            const { error: insertError } = await supabase
                .from('push_subscriptions')
                .insert({
                    user_id: finalUserId,
                    subscription: subscription
                });
            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Save subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
