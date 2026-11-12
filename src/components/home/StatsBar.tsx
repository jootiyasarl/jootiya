/**
 * StatsBar — lightweight social-proof strip (OLX/Avito-style).
 * Server component: zero client JS, rendered into the initial HTML.
 */

interface StatsBarProps {
  adsCount: number;
  usersCount: number;
  citiesCount: number;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export function StatsBar({ adsCount, usersCount, citiesCount }: StatsBarProps) {
  const stats = [
    { value: fmt(adsCount), label: "annonces actives" },
    { value: fmt(usersCount), label: "membres" },
    { value: fmt(citiesCount), label: "villes couvertes" },
    { value: "100%", label: "gratuit" },
  ];

  return (
    <section
      aria-label="Statistiques Jootiya"
      className="border-y border-zinc-200/70 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 sm:gap-x-12">
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-baseline gap-2">
            {i > 0 && (
              <span className="mr-6 hidden h-4 w-px bg-zinc-300 dark:bg-zinc-700 sm:block" aria-hidden />
            )}
            <span className="text-lg font-black tabular-nums text-zinc-900 dark:text-white sm:text-xl">
              {s.value}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
