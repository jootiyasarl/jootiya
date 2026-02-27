import Link from 'next/link';
import { ArrowRight, PlusCircle } from "lucide-react";

export function SellBanner() {
    return (
        <div className="relative w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#FFF5F1] dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 group">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-200/40 rounded-full -translate-x-12 -translate-y-12 sm:-translate-x-16 sm:-translate-y-16 blur-2xl sm:blur-3xl group-hover:bg-orange-300/40 transition-colors duration-700" />
            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-blue-200/30 rounded-full translate-x-12 translate-y-12 sm:translate-x-16 sm:translate-y-16 blur-2xl sm:blur-3xl group-hover:bg-blue-300/30 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col items-center justify-center py-8 sm:py-10 px-4 sm:px-6 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-5 sm:mb-6 tracking-tight px-2">
                    C&apos;est le moment de vendre
                </h2>
                
                <Link 
                    href="/marketplace/post"
                    className="group/btn relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 h-12 sm:h-14 bg-[#F25C05] hover:bg-[#D44D04] text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg sm:shadow-xl shadow-orange-200 dark:shadow-none transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden w-[90%] sm:w-auto justify-center"
                >
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Déposer une annonce</span>
                    
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shine" />
                </Link>
            </div>
            
            {/* Side Decorative Blobs (inspired by the user image) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 sm:w-16 sm:h-24 bg-orange-400/20 rounded-r-full blur-lg sm:blur-xl block opacity-50 sm:opacity-100" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 sm:w-16 sm:h-24 bg-blue-500/20 rounded-l-full blur-lg sm:blur-xl block opacity-50 sm:opacity-100" />
        </div>
    );
}
