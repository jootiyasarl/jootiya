import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Mock implementation
serve(async (req) => {
    try {
        const payload = await req.json();
        // Payload from DB Webhook: { type: 'INSERT', table: 'ads', record: { ... }, old_record: null }
        const { record } = payload;

        if (!record || !record.city) {
            return new Response(JSON.stringify({ message: "No city in record" }), { status: 200 });
        }

        const topic = `city_${record.city}`;

        // 🚨 TODO: Send to FCM
        // await admin.messaging().send({ topic, notification: { title: 'Nouvelle Hamza!', body: record.title } });

        console.log(`Mock: Sending notification to topic ${topic} for ad ${record.title}`);

        return new Response(
            JSON.stringify({ success: true, message: `Sent to ${topic}` }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }
});
