"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useInView — fires once when the element enters the viewport.
 * @param rootMargin  Extra margin around viewport (default "0px 0px -60px 0px")
 * @param threshold   Visibility ratio needed to trigger (default 0.05)
 */
export function useInView(
  rootMargin = "0px 0px -60px 0px",
  threshold = 0.05
) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // fire once only
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

