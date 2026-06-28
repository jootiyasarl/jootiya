import { getServerUser } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getConversations } from "@/lib/db/messaging";
import { MessagingClient } from "./MessagingClient";
import { Suspense } from "react";
import { MessagingSkeleton } from "@/components/dashboard/messages/MessagingSkeleton";

export default async function MessagesPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login?next=/dashboard/messages");
    }

    const conversations = await getConversations();

    return (
        <div className="h-[calc(100vh-140px)]">
            <Suspense fallback={<MessagingSkeleton />}>
                <MessagingClient initialConversations={conversations} currentUser={user} />
            </Suspense>
        </div>
    );
}
