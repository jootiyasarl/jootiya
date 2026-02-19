"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SimpleSearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery) {
            router.push(`/marketplace?q=${encodeURIComponent(trimmedQuery)}`);
        } else {
            router.push("/marketplace");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/20 rounded-full p-1 h-11 transition-all shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:shadow-md hover:bg-white dark:hover:bg-zinc-900">
                {/* Keyword Search */}
                <div className="flex-1 flex items-center px-4 gap-2.5 min-w-0">
                    <Search className="w-4 h-4 text-orange-500/70 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="w-full bg-transparent outline-none text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 placeholder:font-medium"
                    />
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="h-9 w-9 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black p-0 shadow-md shadow-orange-500/10 flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0 ml-1"
                >
                    <Search className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
}
