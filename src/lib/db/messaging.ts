import { getAuthenticatedServerClient } from "../supabase";
import { Conversation } from "@/types/messaging";

export async function getConversations() {
    const supabase = await getAuthenticatedServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            ad:ads(title, image_urls),
            buyer:profiles!buyer_id(id, full_name, avatar_url),
            seller:profiles!seller_id(id, full_name, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }

    return (data || []).map((conv: any) => {
        const isBuyer = conv.buyer_id === user.id;
        const otherParty = isBuyer ? conv.seller : conv.buyer;

        return {
            ...conv,
            other_party: otherParty
        };
    }) as Conversation[];
}
