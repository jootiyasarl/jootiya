import Link from 'next/link';
import { PlusCircle } from "lucide-react";

export function SellBanner() {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFF5F1] dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 group max-w-4xl mx-auto">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-200/40 rounded-full -translate-x-12 -translate-y-12 sm:-translate-x-16 sm:-translate-y-16 blur-2xl sm:blur-3xl group-hover:bg-orange-300/40 transition-colors duration-700" />
            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-blue-200/30 rounded-full translate-x-12 translate-y-12 sm:translate-x-16 sm:translate-y-16 blur-2xl sm:blur-3xl group-hover:bg-blue-300/30 transition-colors duration-700" />
            
            <div className="relative z-10 grid grid-cols-1 min-[420px]:grid-cols-[minmax(170px,auto)_1fr] items-center py-4 sm:py-5 px-4 sm:px-8 text-left gap-3 min-[420px]:gap-4">
                <h2 className="text-sm min-[420px]:text-base sm:text-lg md:text-xl font-black text-black dark:text-white tracking-tight leading-tight whitespace-normal min-[420px]:whitespace-nowrap">
                    C&apos;est le moment de vendre
                </h2>
                
                <Link 
                    href="/marketplace/post"
                    className="group/btn relative inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 h-9 sm:h-10 bg-[#F25C05] hover:bg-[#D44D04] text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md dark:shadow-none transition-all duration-300 hover:-translate-y-0.5 active:scale-95 overflow-hidden whitespace-nowrap w-full"
                >
                    <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Déposer une annonce</span>
                </Link>
            </div>
        </div>
    );
}
