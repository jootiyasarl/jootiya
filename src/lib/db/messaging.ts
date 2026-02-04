import { createSupabaseServerClient } from "../supabase";

export type Conversation = {
    id: string;
    ad_id: string | null;
    buyer_id: string;
    seller_id: string;
    last_message_at: string;
    created_at: string;
    ad?: {
        title: string;
        image_urls: string[];
    };
    other_party?: {
        id: string;
        full_name: string;
        avatar_url: string;
    };
};

export type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
};

export async function getConversations() {
    const supabase = createSupabaseServerClient();
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

export async function getMessages(conversationId: string) {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return data as Message[];
}
