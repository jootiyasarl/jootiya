import { supabase } from "./supabaseClient";

/**
 * Generates a Supabase Transformation URL for optimized image fetching.
 * Enables ultra-fast 20KB thumbnails for feeds.
 */
export function getOptimizedImageUrl(url: string, options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill'; format?: 'webp' | 'origin' } = {}) {
    if (!url || !url.includes('/storage/v1/object/public/')) return url;

    const { width = 200, height = 200, quality = 50, resize = 'cover', format = 'webp' } = options;

    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.replace('/object/public/', '/render/image/public/');
        return `${urlObj.origin}${path}?width=${width}&height=${height}&quality=${quality}&resize=${resize}&format=${format}`;
    } catch (e) {
        return url;
    }
}

/**
 * Deletes a file from Supabase Storage given its public URL.
 * Supports the "Zero Waste" requirement of cleaning up storage on deletion.
 */
export async function deleteFileByUrl(url: string) {
    if (!url) return;

    try {
        // Extract bucket name and file path from URL
        // Example URL: https://.../storage/v1/object/public/ad-images/chat-attachments/filename.webp
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/public/')[1]?.split('/');

        if (!pathParts || pathParts.length < 2) return;

        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');

        console.log(`Senior/ZeroWaste: Deleting ${filePath} from bucket ${bucket}`);

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error("ZeroWaste: Error deleting file:", error);
        }
    } catch (err) {
        console.error("ZeroWaste: Failed to parse URL for deletion:", err);
    }
}
