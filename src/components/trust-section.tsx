"use client";

import { ShieldCheck, Shield, Eye, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustSectionProps {
  className?: string;
}

const trustItems = [
  {
    id: "verified-sellers",
    icon: ShieldCheck,
    title: "Verified sellers",
    description:
      "Look for verification badges on profiles and listings before you commit.",
  },
  {
    id: "secure-platform",
    icon: Shield,
    title: "Secure platform",
    description:
      "We keep accounts, sessions, and messaging behind modern security defaults.",
  },
  {
    id: "moderated-ads",
    icon: Eye,
    title: "Moderated ads",
    description:
      "New listings can be reviewed and flagged so spam and scams stay out.",
  },
  {
    id: "local-community",
    icon: Users,
    title: "Local community first",
    description:
      "Designed for nearby meetups in familiar public places, not anonymous bulk.",
  },
] as const;

export function TrustSection({ className }: TrustSectionProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-3xl border border-zinc-100 bg-white px-5 py-6 sm:px-6",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            Trust & safety
          </h2>
          <p className="text-xs text-zinc-500">
            Clear rules and simple tools to keep buyers and sellers safe.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl bg-zinc-50 p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-50">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-900">
                  {item.title}
                </p>
                <p className="text-xs text-zinc-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
