import { getServerUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getConversations } from "@/lib/db/messaging";
import { MessagingClient } from "./MessagingClient";
import { Suspense } from "react";

export default async function MessagesPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login?redirectTo=/dashboard/messages");
    }

    const conversations = await getConversations();

    return (
        <div className="h-[calc(100vh-140px)]">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-zinc-400 font-bold">Chargement...</div>}>
                <MessagingClient initialConversations={conversations} currentUser={user} />
            </Suspense>
        </div>
    );
}
