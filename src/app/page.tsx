import React, { Suspense } from "react";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <HomeClient initialParams={resolvedParams} />
    </Suspense>
  );
}
