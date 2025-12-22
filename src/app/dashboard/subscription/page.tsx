"use client";

import { useState } from "react";
import {
  SubscriptionCard,
  SubscriptionTierId,
  SubscriptionLimitItem,
} from "@/components/subscription/SubscriptionCard";

type PlanDefinition = {
  id: SubscriptionTierId;
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  isPopular?: boolean;
  helperText?: string;
  limits: SubscriptionLimitItem[];
};

const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    description: "For new sellers getting started.",
    price: "0 MAD",
    priceSuffix: "forever",
    helperText: "Ideal while you are testing Jootiya.",
    limits: [
      {
        label: "Active ads",
        value: "Up to 3 live listings",
      },
      {
        label: "Images per ad",
        value: "Up to 3 uploads",
      },
      {
        label: "Featured ads",
        value: "0 featured ads",
        muted: true,
      },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "For growing sellers who publish regularly.",
    price: "149 MAD",
    priceSuffix: "/month",
    isPopular: true,
    helperText: "Best balance between visibility and price.",
    limits: [
      {
        label: "Active ads",
        value: "Up to 25 live listings",
      },
      {
        label: "Images per ad",
        value: "Up to 8 uploads",
      },
      {
        label: "Featured ads",
        value: "Up to 3 featured ads",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power sellers and shops.",
    price: "299 MAD",
    priceSuffix: "/month",
    helperText: "Maximum exposure with higher featured limits.",
    limits: [
      {
        label: "Active ads",
        value: "Unlimited listings",
      },
      {
        label: "Images per ad",
        value: "Up to 12 uploads",
      },
      {
        label: "Featured ads",
        value: "Up to 10 featured ads",
      },
    ],
  },
];

const PLAN_ORDER: SubscriptionTierId[] = ["free", "premium", "pro"];

export default function SubscriptionPage() {
  const [currentPlanId, setCurrentPlanId] =
    useState<SubscriptionTierId>("free");
  const [processingPlanId, setProcessingPlanId] =
    useState<SubscriptionTierId | null>(null);

  const currentPlan =
    PLANS.find((plan) => plan.id === currentPlanId) ?? PLANS[0];

  async function handleSelectPlan(targetPlanId: SubscriptionTierId) {
    if (targetPlanId === currentPlanId) {
      return;
    }

    setProcessingPlanId(targetPlanId);

    try {
      console.log("Subscription change requested", {
        from: currentPlanId,
        to: targetPlanId,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentPlanId(targetPlanId);
    } finally {
      setProcessingPlanId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Subscription
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Compare plans, see your current limits, and upgrade when you
              need more reach.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border bg-white px-4 py-4 text-sm text-zinc-700 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Current plan
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {currentPlan.name}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {currentPlan.description}
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 text-xs text-zinc-500 md:items-end">
              <span>
                {currentPlan.price === "0 MAD"
                  ? "Free forever"
                  : `${currentPlan.price} ${
                      currentPlan.priceSuffix ?? ""
                    }`}
              </span>
              <span>
                Changes take effect immediately after payment is
                confirmed.
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const rank = PLAN_ORDER.indexOf(plan.id);
            const currentRank = PLAN_ORDER.indexOf(currentPlanId);

            let ctaLabel = "Select plan";

            if (isCurrent) {
              ctaLabel = "Current plan";
            } else if (rank > currentRank) {
              ctaLabel = `Upgrade to ${plan.name}`;
            } else if (rank < currentRank) {
              ctaLabel = `Downgrade to ${plan.name}`;
            }

            const isProcessing = processingPlanId === plan.id;

            return (
              <SubscriptionCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                priceSuffix={plan.priceSuffix}
                isCurrent={isCurrent}
                isPopular={plan.isPopular}
                ctaLabel={isProcessing ? "Processing..." : ctaLabel}
                helperText={plan.helperText}
                disabled={isProcessing}
                limits={plan.limits}
                onCtaClick={handleSelectPlan}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
