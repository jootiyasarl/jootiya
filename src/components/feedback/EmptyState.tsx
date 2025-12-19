"use client";

import type { EmptyStateProps } from "@/types/components/marketplace";

export function EmptyState({
  title,
  description,
  primaryActionLabel,
  onPrimaryActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-zinc-50 px-6 py-10 text-center">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description ? (
        <p className="max-w-sm text-xs text-zinc-500">{description}</p>
      ) : null}
      {primaryActionLabel && onPrimaryActionClick ? (
        <button
          type="button"
          onClick={onPrimaryActionClick}
          className="mt-2 inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800"
        >
          {primaryActionLabel}
        </button>
      ) : null}
    </div>
  );
}
