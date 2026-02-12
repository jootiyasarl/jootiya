import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical } from "lucide-react";

export function MessagingSkeleton() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-zinc-950 md:relative md:inset-auto md:z-auto md:h-[calc(100vh-140px)] md:rounded-3xl md:border md:border-zinc-200 md:shadow-2xl overflow-hidden animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 w-full md:w-80 lg:w-96 md:border-r md:border-zinc-100">
        <div className="px-4 py-5 md:p-6 border-b border-zinc-50 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-900 rounded-full" />
          </div>
          <div className="h-11 w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl" />
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-10 bg-zinc-50 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-3 w-32 bg-zinc-50 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-50 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area Skeleton (Desktop) */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-zinc-50/30 dark:bg-zinc-950/30 items-center justify-center">
        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 mb-6" />
        <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-zinc-50 dark:bg-zinc-900 rounded-lg" />
      </div>
    </div>
  );
}
