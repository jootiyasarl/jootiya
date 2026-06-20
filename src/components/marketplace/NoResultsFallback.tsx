"use client";

interface NoResultsFallbackProps {
    searchQuery?: string;
    category?: string;
    city?: string;
}

export function NoResultsFallback(_props: NoResultsFallbackProps) {
    return null;
}
