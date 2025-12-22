"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Minus } from "lucide-react";

export type SubscriptionTierId = "free" | "premium" | "pro";

export interface SubscriptionLimitItem {
  label: string;
  value: string;
  muted?: boolean;
}

export interface SubscriptionCardProps {
  id: SubscriptionTierId;
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  isCurrent?: boolean;
  isPopular?: boolean;
  ctaLabel: string;
  helperText?: string;
  disabled?: boolean;
  limits: SubscriptionLimitItem[];
  onCtaClick?: (id: SubscriptionTierId) => void;
}

export function SubscriptionCard(props: SubscriptionCardProps) {
  const {
    id,
    name,
    description,
    price,
    priceSuffix,
    isCurrent,
    isPopular,
    ctaLabel,
    helperText,
    disabled,
    limits,
    onCtaClick,
  } = props;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isCurrent && "border-zinc-900 ring-2 ring-zinc-900/10",
        !isCurrent && isPopular && "border-zinc-900/70 ring-1 ring-zinc-900/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{name}</h3>
          <p className="mt-1 text-xs text-zinc-500">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isCurrent ? (
            <Badge variant="secondary">Current plan</Badge>
          ) : null}
          {!isCurrent && isPopular ? <Badge>Most popular</Badge> : null}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-zinc-900">{price}</span>
        {priceSuffix ? (
          <span className="text-xs font-medium text-zinc-500">
            {priceSuffix}
          </span>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2 text-sm">
        {limits.map((item) => {
          const Icon = item.muted ? Minus : Check;
          return (
            <li
              key={item.label}
              className={cn(
                "flex items-start gap-2",
                item.muted ? "text-zinc-400" : "text-zinc-700",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                  item.muted
                    ? "border border-zinc-300 bg-zinc-50 text-zinc-400"
                    : "bg-zinc-900 text-white",
                )}
              >
                <Icon className="h-3 w-3" />
              </div>
              <div>
                <span className="font-medium text-zinc-900">
                  {item.label}
                </span>{" "}
                <span
                  className={item.muted ? "text-zinc-400" : "text-zinc-700"}
                >
                  {item.value}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={disabled || isCurrent}
          onClick={() => {
            if (disabled || isCurrent) return;
            onCtaClick?.(id);
          }}
        >
          {ctaLabel}
        </Button>
        {helperText ? (
          <p className="text-center text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
