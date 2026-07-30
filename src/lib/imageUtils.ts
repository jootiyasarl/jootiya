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
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .withMetadata() // Crucial for preserving location/date EXIF data
            .webp({ quality: 75 }) // Industry standard for 2026 speed/quality balance
            .toBuffer();
    } catch (error) {
        console.error('Sharp Image Processing Error:', error);
        throw new Error('Failed to process image for SEO');
    }
}
