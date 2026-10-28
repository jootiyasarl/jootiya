import { AdDetailSkeleton } from "@/components/ads/AdDetailSkeleton";

// This file shows while page.tsx is fetching data on the server.
// It must render FAST — no async, no imports that could hang.
export default function Loading() {
  return <AdDetailSkeleton />;
}
