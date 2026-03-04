import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("sb-access-token")?.value;

        if (!accessToken) {
            console.error("Admin API Unauthorized - No access token cookie found");
            return NextResponse.json({ error: "Unauthorized. Please login again." }, { status: 401 });
        }

        const supabase = createSupabaseServerClient();
        
        // 1. Verify Admin (Strict Check) - Use the token explicitly to get the user
        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

        if (authError || !user) {
            console.error("Admin API Auth Error:", authError?.message);
            return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
        }

        console.log("Admin API Auth Check - User Email:", user.email);

        if (user.email !== 'jootiyasarl@gmail.com') {
            console.error("Admin API Unauthorized - Expected: jootiyasarl@gmail.com, Got:", user.email);
            return NextResponse.json({ 
                error: "Unauthorized. Admin access only.",
                debug: process.env.NODE_ENV === 'development' ? { email: user.email } : undefined 
            }, { status: 403 });
        }

        // 2. Fetch all subscriptions with more details
        const { data: subscriptions, error: fetchError } = await supabase
            .from('push_subscriptions')
            .select('subscription, created_at, user_id');

        if (fetchError) throw fetchError;

        console.log(`[Push API] Found ${subscriptions?.length || 0} subscriptions in database`);

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ 
                success: true, 
                count: 0, 
                message: "Aucun abonné trouvé dans la base de données." 
            });
        }

        // 3. Send notifications in parallel
        console.log(`[Push API] Sending to ${subscriptions.length} subscribers`);
        
        const results = await Promise.allSettled(subscriptions.map(async (sub: any) => {
            try {
                // Ensure the subscription object is correctly formatted for web-push
                const subscription = typeof sub.subscription === 'string' 
                    ? JSON.parse(sub.subscription) 
                    : sub.subscription;

                await webpush.sendNotification(
                    subscription,
                    JSON.stringify({ 
                        title: title || 'Jootiya', 
                        body: body || 'Nouvelle notification', 
                        url: url || '/' 
                    })
                );
                return { success: true };
            } catch (error: any) {
                console.error("Error sending notification to one subscriber:", error.statusCode, error.message);
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // TODO: Optional cleanup logic
                }
                throw error;
            }
        }));

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        console.log(`[Push API] Batch complete. Success: ${successCount}, Failed: ${failCount}`);

        return NextResponse.json({ 
            success: true, 
            count: subscriptions.length,
            results: {
                success: successCount,
                failed: failCount
            }
        });
    } catch (error: any) {
        console.error("Send notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
