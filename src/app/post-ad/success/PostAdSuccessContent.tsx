"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type StatusCopy = {
  badge: string;
  title: string;
  description: string;
  highlight: string;
};

function getStatusCopy(status: string | null): StatusCopy {
  if (status === "active") {
    return {
      badge: "Live",
      title: "Your ad is live and ready to be discovered",
      description:
        "We've published your listing. Buyers near you can now find, save, and contact you about this ad.",
      highlight:
        "Tip: Promote your ad to push it higher in search results and reach more serious buyers.",
    };
  }

  return {
    badge: "Pending review",
    title: "Your ad was submitted for review",
    description:
      "We run a quick safety and quality check before showing your ad to buyers. This usually takes just a few minutes.",
    highlight:
      "You will receive an email as soon as your ad is live. You can still promote it now to secure better placement once approved.",
  };
}

export function PostAdSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const copy = getStatusCopy(status);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 pt-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                ✓
              </span>
              Ad created successfully
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              {copy.description}
            </p>
          </div>

          <div className="hidden text-right text-xs text-zinc-500 sm:block">
            <p className="font-medium text-zinc-700">Next steps</p>
            <p>Review your ad, track its performance, and upgrade when needed.</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-100 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ad status
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-50">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{copy.badge}</span>
              </div>
              <p className="mt-2 max-w-md text-xs text-zinc-500">
                {copy.highlight}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-zinc-500 md:text-right">
              <p>We apply automated and manual checks to keep Jootiya safe.</p>
              <p>
                Most ads are approved in &lt; 10 minutes. If anything looks
                unusual, our team may contact you.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-zinc-100 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h2 className="text-sm font-semibold text-zinc-900">
              What you can do next
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              You're in control of how many people see your ad. Use your
              dashboard to monitor performance and upgrade when you need more
              reach.
            </p>

            <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-700">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                  1
                </span>
                <div>
                  <p className="font-medium">Review your listing</p>
                  <p className="text-zinc-500">
                    Check images, price, and description to make sure everything
                    looks exactly how you want buyers to see it.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                  2
                </span>
                <div>
                  <p className="font-medium">Promote your ad</p>
                  <p className="text-zinc-500">
                    Boost visibility with featured placement, so your ad shows
                    up higher and reaches more serious buyers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                  3
                </span>
                <div>
                  <p className="font-medium">Respond quickly</p>
                  <p className="text-zinc-500">
                    Fast replies build trust and help you close deals faster.
                    Keep notifications on so you don't miss new messages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-900 px-5 py-5 text-zinc-50 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Why sellers trust Jootiya
              </p>
              <p className="text-sm font-semibold">
                Designed to keep both you and buyers safe.
              </p>
              <ul className="mt-2 space-y-2 text-xs text-zinc-300">
                <li>- Smart fraud detection on every new ad.</li>
                <li>- Privacy-friendly messaging between you and buyers.</li>
                <li>- Clear reporting tools if something doesn't feel right.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 text-[11px] text-zinc-400">
              <p>
                We never share your email or phone publicly without your
                consent. You stay in control of your data and your deals.
              </p>
              <p>
                By promoting your ad, you support a safer marketplace and help
                us keep bad actors out.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-xs text-zinc-500">
            <p className="font-medium text-zinc-700">Ready when you are</p>
            <p>
              You can always come back to this ad from your dashboard to edit,
              pause, or promote it.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push("/dashboard/profile")}
            >
              Go to dashboard
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => router.push("/dashboard/subscription")}
            >
              Promote this ad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
