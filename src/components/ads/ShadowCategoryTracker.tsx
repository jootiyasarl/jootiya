"use client";

import { useEffect } from "react";
import { shadowTracker } from "@/lib/shadow-tracker";

interface ShadowCategoryTrackerProps {
  categorySlug: string;
  categoryName?: string;
}

export function ShadowCategoryTracker({ categorySlug, categoryName }: ShadowCategoryTrackerProps) {
  useEffect(() => {
    // Track direct category visit
    shadowTracker.trackEvent({
      type: 'category_visit',
      category: categorySlug,
      categoryName: categoryName
    });
  }, [categorySlug, categoryName]);

  return null;
}
