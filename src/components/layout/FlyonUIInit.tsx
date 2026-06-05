"use client";

import { useEffect } from "react";

export function FlyonUIInit() {
  useEffect(() => {
    // Dynamically import flyonui JS for interactive components
    import("flyonui").catch(() => {
      // flyonui JS is optional; components work with CSS classes alone
    });
  }, []);

  return null;
}
