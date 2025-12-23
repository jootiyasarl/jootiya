"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SubscriptionUpgradeCtaProps {
  className?: string;
}

export function SubscriptionUpgradeCta({ className }: SubscriptionUpgradeCtaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-4 text-sm text-amber-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Sparkles className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Get more from your ads
            </span>
          </div>

          <p className="text-sm font-medium text-amber-950">
            Upgrade to Premium to reach more buyers and unlock extra visibility.
          </p>

          <ul className="mt-2 grid gap-1.5 text-xs text-amber-900 sm:grid-cols-3">
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>
                <span className="font-medium">Featured ads</span>
                <span className="text-amber-800"> for priority placement.</span>
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>
                <span className="font-medium">More images</span>
                <span className="text-amber-800"> to showcase every detail.</span>
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>
                <span className="font-medium">Higher visibility</span>
                <span className="text-amber-800"> with better reach across Jootiya.</span>
              </span>
            </li>
          </ul>
        </div>

        <div className="hidden flex-col items-end gap-2 sm:flex">
          <Link
            href="/dashboard/subscription"
            className="inline-flex h-8 items-center justify-center rounded-md bg-amber-900 px-3 text-xs font-medium text-amber-50 shadow-sm transition hover:bg-amber-800"
          >
            Upgrade plan
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
          <span className="text-[11px] text-amber-800/80">
            No long-term commitment.
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
        <Link
          href="/dashboard/subscription"
          className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-amber-900 px-3 text-xs font-medium text-amber-50 shadow-sm transition hover:bg-amber-800"
        >
          Upgrade plan
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] text-amber-800/80">
          Cancel anytime.
        </span>
      </div>

      <div className="pointer-events-none absolute -right-10 top-[-40px] h-36 w-36 rounded-full bg-gradient-to-br from-amber-200/70 via-transparent to-transparent opacity-70" />
    </div>
  );
}
