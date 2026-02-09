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
    message_type: 'text' | 'audio' | 'image' | 'file';
    file_url?: string;
    is_optimistic?: boolean;
};
