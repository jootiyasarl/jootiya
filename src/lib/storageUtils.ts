import { supabase } from "./supabaseClient";

/**
 * Generates a Supabase Transformation URL for optimized image fetching.
 * Enables ultra-fast 20KB thumbnails for feeds.
 * NOTE: Requires Supabase Pro/Paid plan for image transformations.
 */
export function getOptimizedImageUrl(url: string, options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill'; format?: 'webp' | 'origin' } = {}) {
    if (!url || url === '/placeholder-ad.jpg') return '/placeholder-ad.jpg';

    // 1. Fix URL encoding issues (handle spaces and special characters in paths)
    let processedUrl = url.trim();
    
    // 2. Handle relative paths from Supabase
    let absoluteUrl = processedUrl;
    if (!processedUrl.startsWith('http')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mshnkdqclscfytvdbmre.supabase.co';
        const cleanPath = processedUrl.startsWith('/') ? processedUrl.substring(1) : processedUrl;
        
        if (cleanPath.startsWith('storage/v1/object/public/')) {
            absoluteUrl = `${supabaseUrl}/${cleanPath}`;
        } else if (cleanPath.includes('ad-images/')) {
            // Path already contains bucket name
            absoluteUrl = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
        } else {
            // Assume it's a direct filename in ad-images
            absoluteUrl = `${supabaseUrl}/storage/v1/object/public/ad-images/${cleanPath}`;
        }
    }

    // 3. Ensure the URL is properly encoded for characters like spaces
    try {
        const urlParts = absoluteUrl.split('?');
        const baseUrl = urlParts[0];
        const params = urlParts[1] ? `?${urlParts[1]}` : '';
        
        // Encode only the path part, not the protocol/domain
        const urlObj = new URL(baseUrl);
        absoluteUrl = urlObj.toString() + params;
    } catch (e) {
        // Fallback to basic replacement if URL parsing fails
        absoluteUrl = absoluteUrl.replace(/ /g, '%20');
    }

    // 4. Check if transformations are enabled
    const isTransformEnabled = process.env.NEXT_PUBLIC_SUPABASE_TRANSFORMATIONS_ENABLED === 'true';

    // If it's not a Supabase URL or transformations are off, return the absolute URL
    if (!absoluteUrl.includes('/storage/v1/object/public/') || !isTransformEnabled) {
        return absoluteUrl;
    }

    const { width = 400, height = 400, quality = 70, resize = 'cover', format = 'webp' } = options;

    try {
        const urlObj = new URL(absoluteUrl);
        // Supabase Transformation URL replacement
        const path = urlObj.pathname.replace('/object/public/', '/render/image/public/');
        
        // Add transformation parameters
        const transformParams = new URLSearchParams();
        transformParams.append('width', width.toString());
        transformParams.append('height', height.toString());
        transformParams.append('quality', quality.toString());
        transformParams.append('resize', resize);
        transformParams.append('format', format);

        return `${urlObj.origin}${path}?${transformParams.toString()}`;
    } catch (e) {
        console.warn("StorageUtils: Transformation failed, using original URL", e);
        return absoluteUrl;
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
