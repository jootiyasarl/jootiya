/**
 * Slugification utility for Jootiya.com
 * Supports Arabic (Unicode) and Latin characters.
 */

export function slugify(text: string): string {
    if (!text) return "";

    return text
        .toString()
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/\s+/g, "-")
        // Remove characters that aren't letters (Latin or Arabic), numbers, or hyphens
        // This regex preserves Arabic characters: \u0600-\u06FF
        .replace(/[^\w\u0600-\u06FF-]+/g, "")
        // Replace multiple consecutive hyphens with a single one
        .replace(/--+/g, "-")
        // Remove leading and trailing hyphens
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

/**
 * Generates a unique slug by appending a short portion of the UUID.
 * This prevents collisions while keeping the URL readable.
 */
export function generateAdSlug(title: string, id: string): string {
    const baseSlug = slugify(title);
    const shortId = id.split("-")[0]; // Take the first part of the UUID (8 chars)

    if (!baseSlug) return shortId;

    return `${baseSlug}-${shortId}`;
}
