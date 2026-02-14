"use server";

import { getAuthenticatedServerClient, getServerUser } from "@/lib/supabase-server";
import { slugify } from "@/lib/slug";

export type AdStatus = "pending" | "active" | "rejected";

export interface AdActionPayload {
    title: string;
    description: string;
    price: number | string;
    category: string;
    city: string;
    neighborhood?: string | null;
    phone: string;
    condition: 'new' | 'used';
    image_urls: string[];
    latitude?: number | null;
    longitude?: number | null;
}

export async function createAdAction(data: AdActionPayload) {
    try {
        const authClient = await getAuthenticatedServerClient();
        const user = await getServerUser();

        if (!user) {
            throw new Error("Vous devez être connecté pour publier une annonce.");
        }

        const baseSlug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const uniqueId = Math.random().toString(36).substring(2, 7);
        const slug = `${baseSlug}-${uniqueId}`;

        const { data: result, error: insertError } = await authClient
            .from('ads')
            .insert({
                seller_id: user.id,
                title: data.title,
                slug: slug,
                description: data.description,
                price: Number(data.price),
                currency: 'MAD',
                city: data.city,
                neighborhood: data.neighborhood || null,
                phone: data.phone,
                category: data.category,
                image_urls: data.image_urls,
                latitude: data.latitude,
                longitude: data.longitude,
                status: 'active'
            })
            .select('id')
            .single();

        if (insertError) throw insertError;

        return { success: true, id: result.id };
    } catch (error: any) {
        console.error("Ad Action Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateAdAction(id: string, data: AdActionPayload) {
    try {
        const authClient = await getAuthenticatedServerClient();
        const user = await getServerUser();

        if (!user) {
            throw new Error("Vous devez être connecté pour modifier une annonce.");
        }

        const { error: updateError } = await authClient
            .from('ads')
            .update({
                title: data.title,
                description: data.description,
                price: Number(data.price),
                city: data.city,
                neighborhood: data.neighborhood || null,
                phone: data.phone,
                category: data.category,
                image_urls: data.image_urls,
                latitude: data.latitude,
                longitude: data.longitude,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('seller_id', user.id);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error: any) {
        console.error("Ad Action Update Error:", error);
        return { success: false, error: error.message };
    }
}
