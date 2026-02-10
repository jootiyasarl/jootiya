"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={cn(
                "flex bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse",
                compact ? "w-10 h-10" : "w-[140px] h-11"
            )} />
        );
    }

    if (compact) {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        return (
            <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all active:scale-95 shadow-sm overflow-hidden"
                title="Changer le thème"
            >
                {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
        );
    }

    const options = [
        { id: 'light', icon: Sun, label: 'Clair' },
        { id: 'system', icon: Monitor, label: 'Système' },
        { id: 'dark', icon: Moon, label: 'Sombre' },
    ];

    return (
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-700 shadow-inner">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                            isActive
                                ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-500 shadow-sm scale-[1.02]"
                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
