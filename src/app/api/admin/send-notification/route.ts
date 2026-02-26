import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import webpush from "web-push";

// Configure web-push with VAPID keys (Only if keys are present to avoid build errors)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:jootiyasarl@gmail.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: Request) {
    try {
        const { title, body, url } = await request.json();
        const supabase = createSupabaseServerClient();
        
        // 1. Verify Admin (Strict Check) - Try both getUser and getSession for reliability
        const { data: { user: userAuth } } = await supabase.auth.getUser();
        let user = userAuth;

        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user || null;
        }

        console.log("Admin API Auth Check - User Email:", user?.email);

        if (!user || user.email !== 'jootiyasarl@gmail.com') {
            console.error("Admin API Unauthorized - Expected: jootiyasarl@gmail.com, Got:", user?.email);
            return NextResponse.json({ 
                error: "Unauthorized. Admin access only.",
                debug: process.env.NODE_ENV === 'development' ? { email: user?.email } : undefined 
            }, { status: 403 });
        }

        // 2. Fetch all subscriptions
        const { data: subscriptions, error: fetchError } = await supabase
            .from('push_subscriptions')
            .select('subscription');

        if (fetchError) throw fetchError;

        // 3. Send notifications in parallel
        const notifications = subscriptions.map(async (sub: any) => {
            try {
                await webpush.sendNotification(
                    sub.subscription,
                    JSON.stringify({ title, body, url })
                );
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired or no longer valid - cleanup
                    console.log("Cleaning up invalid subscription");
                }
                console.error("Error sending notification:", error);
            }
        });

        await Promise.all(notifications);

        return NextResponse.json({ success: true, count: subscriptions.length });
    } catch (error: any) {
        console.error("Send notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
