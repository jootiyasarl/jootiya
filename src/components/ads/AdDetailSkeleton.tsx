"use client";

// ─────────────────────────────────────────────────────────────────
// Pulse Primitive — single reusable atom
// ─────────────────────────────────────────────────────────────────
function Bone({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// AdDetailSkeleton
// Dimensions mirror the real PDP layout exactly to prevent CLS.
// ─────────────────────────────────────────────────────────────────
export function AdDetailSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-12 font-sans antialiased overflow-x-hidden">

      {/* ── Breadcrumb bar ── */}
      <div className="bg-white border-b border-gray-100 h-12 flex items-center px-4 sm:px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Bone className="h-3 w-56 rounded-full" />
          <Bone className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      {/* ── Content wrapper ── */}
      <div className="max-w-6xl mx-auto px-0 sm:px-6 pt-0 sm:pt-5">

        {/* Title strip */}
        <div className="px-4 sm:px-0 pt-4 sm:pt-0 pb-3 space-y-2.5">
          <div className="flex gap-1.5">
            <Bone className="h-5 w-16 rounded-md" />
            <Bone className="h-5 w-20 rounded-md" />
          </div>
          <Bone className="h-7 w-3/4 sm:w-1/2 rounded-lg" />
          <div className="flex gap-4">
            <Bone className="h-3.5 w-24 rounded-full" />
            <Bone className="h-3.5 w-28 rounded-full" />
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

          {/* LEFT — 8 cols */}
          <div className="lg:col-span-8 space-y-3 order-2 lg:order-1">

            {/* Gallery — aspect-[4/3] mobile → aspect-[16/10] desktop */}
            <div className="bg-white border border-gray-100 overflow-hidden sm:rounded-2xl">
              {/* Hero image skeleton */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-200 animate-pulse" />

              {/* Thumbnail strip — 4 thumbs @ 64×64 (mobile) / 72×72 (desktop) */}
              <div className="flex gap-2 px-4 sm:px-0 py-3">
                {[...Array(4)].map((_, i) => (
                  <Bone
                    key={i}
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Price — mobile only */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-1.5">
              <Bone className="h-3 w-10" />
              <Bone className="h-9 w-40 rounded-xl" />
              <Bone className="h-3 w-48" />
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 space-y-3">
              <Bone className="h-5 w-28 rounded-md" />
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-5/6" />
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-3/4" />
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 space-y-3">
              <Bone className="h-5 w-40 rounded-md" />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <Bone className="h-4 w-4 rounded" />
                    <Bone className="h-3.5 w-20" />
                  </div>
                  <Bone className="h-3.5 w-24" />
                </div>
              ))}
            </div>

            {/* Safety tips */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 space-y-3">
              <Bone className="h-4 w-44 rounded-md" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Bone className="h-3.5 w-3.5 rounded mt-0.5 flex-shrink-0" />
                  <Bone className={`h-3 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 4 cols, desktop only */}
          <div className="lg:col-span-4 order-1 lg:order-2 hidden lg:block">
            <div className="sticky top-[72px] space-y-3">

              {/* Price + CTA card */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Price */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-50 space-y-1.5">
                  <Bone className="h-3 w-10" />
                  <Bone className="h-10 w-44 rounded-xl" />
                  <Bone className="h-3 w-52" />
                </div>

                {/* Seller mini */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    {/* Avatar — 40×40 */}
                    <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Bone className="h-3.5 w-32" />
                      <Bone className="h-3 w-28" />
                    </div>
                    <Bone className="h-4 w-4 rounded" />
                  </div>
                </div>

                {/* CTA buttons: WhatsApp h-13 / Phone h-13 / Message h-12 */}
                <div className="px-5 py-4 space-y-3">
                  <Bone className="h-12 w-full rounded-2xl bg-emerald-100" />
                  <Bone className="h-12 w-full rounded-2xl bg-gray-200" />
                  <Bone className="h-11 w-full rounded-2xl" />
                </div>

                {/* Footer note */}
                <div className="px-5 pb-4 flex items-center justify-between">
                  <Bone className="h-3 w-40" />
                  <Bone className="h-10 w-10 rounded-xl" />
                </div>
              </div>

              {/* Share card */}
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bone className="h-9 w-9 rounded-xl flex-shrink-0" />
                  <Bone className="h-3.5 w-36" />
                </div>
                <Bone className="h-4 w-4 rounded" />
              </div>

              {/* Quick details */}
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-3">
                <Bone className="h-3 w-28 rounded-md" />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bone className="h-4 w-4 rounded" />
                      <Bone className="h-3.5 w-16" />
                    </div>
                    <Bone className="h-3.5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar ads ── */}
        <section className="mt-8 pb-4 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <Bone className="h-5 w-44 rounded-md" />
            <Bone className="h-4 w-16 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                {/* Image — aspect-[4/3] */}
                <Bone className="aspect-[4/3] w-full rounded-none" />
                <div className="p-3 space-y-1.5">
                  <Bone className="h-3.5 w-3/4" />
                  <Bone className="h-3 w-full" />
                  <Bone className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Mobile footer skeleton ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 max-w-xl mx-auto">
          <Bone className="flex-1 h-12 rounded-2xl bg-gray-200" />
          <Bone className="flex-1 h-12 rounded-2xl bg-emerald-100" />
          <Bone className="h-12 w-12 rounded-2xl flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
