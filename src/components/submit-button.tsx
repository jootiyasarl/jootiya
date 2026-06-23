"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loadingLabel?: string;
}

export function SubmitButton({
  label,
  loadingLabel = "Please wait...",
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  // If className contains FlyonUI btn classes, use native button to avoid shadcn conflicts
  const isFlyonUI = className?.includes("btn ");

  if (isFlyonUI) {
    return (
      <button
        type="submit"
        className={cn(pending && "opacity-70 cursor-not-allowed", className)}
        disabled={pending || props.disabled}
        {...props}
      >
        {pending ? loadingLabel : label}
      </button>
    );
  }

  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2",
        pending && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={pending || props.disabled}
      {...props}
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
