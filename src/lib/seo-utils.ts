import slugify from 'slugify';

/**
 * Generates a clean, SEO-friendly slug from a title.
 * Supports both Arabic and Latin characters.
 */
export function generateSlug(title: string): string {
    if (!title) return 'item';

    // slugify by default handles Latin characters well
    // For Arabic, we need to ensure it's not stripped if we want it in the URL
    // However, most SEO practices for Arabic sites use either:
    // 1. Transliterated slugs (complex)
    // 2. Encoded Arabic characters (standard for Arabic SEO)
    
    const slug = slugify(title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: false, // Keep Arabic characters
        locale: 'vi',   // Helps with some diacritics
        trim: true
    });

    // Final cleanup: replace spaces with hyphens if slugify missed any, 
    // and remove double hyphens
    return slug
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100); // Limit length for SEO
}
