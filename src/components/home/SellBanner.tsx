import Link from 'next/link';
import { PlusCircle } from "lucide-react";

export function SellBanner() {
    return (
        <div className="card bg-base-100 border border-orange-100 dark:border-orange-900/30 shadow-sm max-w-4xl mx-auto overflow-hidden">
            <div className="card-body py-4 sm:py-5 px-4 sm:px-8">
                <div className="grid grid-cols-1 min-[420px]:grid-cols-[minmax(170px,auto)_1fr] items-center gap-3 min-[420px]:gap-4">
                    <h2 className="text-sm min-[420px]:text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight whitespace-normal min-[420px]:whitespace-nowrap">
                        C&apos;est le moment de vendre
                    </h2>
                    <Link 
                        href="/marketplace/post"
                        className="btn btn-primary btn-sm gap-2 w-full"
                    >
                        <PlusCircle className="w-4 h-4 shrink-0" />
                        Déposer une annonce
                    </Link>
                </div>
            </div>
        </div>
    );
}
