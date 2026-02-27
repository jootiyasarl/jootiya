"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedServerClient, getServerUser } from "@/lib/supabase-server";

export async function sendMessageAction(formData: {
  adId: string;
  sellerId: string;
  content: string;
}) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Veuillez vous connecter pour envoyer un message" };
  }

  if (user.id === formData.sellerId) {
    return { error: "Vous ne pouvez pas vous envoyer un message à vous-même." };
  }

  const supabase = await getAuthenticatedServerClient();

  // 1. Get or Create Conversation
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('ad_id', formData.adId)
    .eq('buyer_id', user.id)
    .eq('seller_id', formData.sellerId)
    .maybeSingle();

  let conversationId;
  if (existingConv) {
    conversationId = existingConv.id;
  } else {
    const { data: newConv, error: insertConvError } = await supabase
      .from('conversations')
      .insert({
        ad_id: formData.adId,
        buyer_id: user.id,
        seller_id: formData.sellerId
      })
      .select('id')
      .single();

    if (insertConvError) return { error: insertConvError.message };
    conversationId = newConv.id;
  }

  // 2. Send Message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: formData.content.trim()
    });

  if (msgError) return { error: msgError.message };

  revalidatePath("/dashboard/messages");
  return { success: true, conversationId };
}

export async function saveSubscriptionAction(subscription: any) {
  const user = await getServerUser();
  if (!user) return { error: "Non connecté" };

  const supabase = await getAuthenticatedServerClient();

  const { error } = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jootiya.com'}/api/notifications/save-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: subscription,
      user_id: user.id
    }),
  }).then(res => res.json());

  if (error) return { error };
  return { success: true };
}
