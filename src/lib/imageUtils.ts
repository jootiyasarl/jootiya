import sharp from 'sharp';

/**
 * SEO Image Preservation Strategy:
 * 1. Converts image to WebP (Google's preferred format).
 * 2. Maintains Metadata (EXIF, GPS, etc.) using .withMetadata().
 * 3. Compresses to 80% quality for optimal speed/SEO balance.
 */
export async function processImageForSEO(buffer: Buffer): Promise<Buffer> {
    try {
        return await sharp(buffer)
            .withMetadata() // Crucial for preserving location/date EXIF data
            .webp({ quality: 80 }) // Industry standard for 2026 speed/quality balance
            .toBuffer();
    } catch (error) {
        console.error('Sharp Image Processing Error:', error);
        throw new Error('Failed to process image for SEO');
    }
}
