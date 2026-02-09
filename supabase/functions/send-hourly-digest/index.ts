import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        // 1. Get ads created in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: newAds, error: adsError } = await supabase
            .from("ads")
            .select("*")
            .gt("created_at", oneHourAgo)
            .eq("status", "active");

        if (adsError) throw adsError;
        if (!newAds || newAds.length === 0) {
            return new Response(JSON.stringify({ message: "No new ads" }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Get active subscriptions (saved searches)
        // In a real app, you'd match ads against searches efficiently.
        // For MVP/Demo: fetch all alert-enabled searches and filter in memory (or use a complex join).
        const { data: searches, error: searchError } = await supabase
            .from("saved_searches")
            .select("*, users(email)")
            .eq("email_alert", true);

        if (searchError) throw searchError;

        // 3. Match ads to users
        const userMatches: Record<string, any[]> = {};

        for (const search of searches) {
            const email = search.users?.email;
            if (!email) continue;

            const matchingAds = newAds.filter(ad => {
                // Simple logic: City match OR Category match
                const cityMatch = !search.city || ad.city === search.city;
                const catMatch = !search.category || ad.category === search.category;
                return cityMatch && catMatch;
            });

            if (matchingAds.length > 0) {
                if (!userMatches[email]) userMatches[email] = [];
                userMatches[email].push(...matchingAds);
            }
        }

        // 4. Send Emails (Batching)
        const emailPromises = Object.entries(userMatches).map(async ([email, ads]) => {
            // De-duplicate ads per user
            const uniqueAds = Array.from(new Set(ads.map(a => a.id)))
                .map(id => ads.find(a => a.id === id));

            // Generate HTML Template
            const adsHtml = uniqueAds.map(ad => `
            <div style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
                <img src="${ad.images?.[0] || 'https://jootiya.com/placeholder.png'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" />
                <div style="display: inline-block; vertical-align: top; margin-left: 10px;">
                    <h3 style="margin: 0 0 5px 0;">${ad.title}</h3>
                    <p style="margin: 0; color: #f97316; font-weight: bold;">${ad.price} DH</p>
                    <p style="margin: 0; color: #666; font-size: 12px;">📍 ${ad.city} • 📏 ${ad.distance || '0'} km</p>
                    <a href="https://jootiya.com/marketplace/${ad.id}" style="display: inline-block; margin-top: 5px; color: #f97316; text-decoration: none; font-size: 12px;">Voir l'annonce &rarr;</a>
                </div>
            </div>
        `).join("");

            const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">🔥 Hamzat de la dernière heure !</h2>
                <p>Voici les nouvelles annonces qui correspondent à vos recherches :</p>
                ${adsHtml}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999; text-align: center;">
                    Vous recevez cet email car vous êtes abonné aux alertes Jootiya.<br/>
                    <a href="https://jootiya.com/dashboard/alerts" style="color: #999;">Se désabonner</a>
                </p>
            </div>
        `;

            return resend.emails.send({
                from: "Jootiya Alerts <updates@jootiya.com>",
                to: email, // Free tier only allows sending to verified email (usually your own) unless domain verified
                subject: `🔥 ${uniqueAds.length} nouvelles hamzat pour vous !`,
                html: html,
            });
        });

        await Promise.all(emailPromises);

        return new Response(
            JSON.stringify({ success: true, sent_count: emailPromises.length }),
            { headers: { "Content-Type": "application/json" } },
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }
});
