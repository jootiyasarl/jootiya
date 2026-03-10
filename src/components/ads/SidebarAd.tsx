import React from 'react';
import { ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';

export const SidebarAd = () => {
  return (
    <Link 
      href="/marketplace/post" 
      className="block w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.98] group overflow-hidden relative"
    >
      {/* Background patterns */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-2xl group-hover:bg-black/20 transition-all" />
      
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100 opacity-80">Jootiya Market</span>
          <h3 className="text-xl font-black leading-tight tracking-tighter uppercase">
            Vendez et achetez sur <span className="text-zinc-950 dark:text-white">Jootiya</span>
          </h3>
        </div>

        <p className="text-xs font-bold text-orange-50 text-balance leading-relaxed opacity-90">
          La meilleure plateforme pour vos petites annonces au Maroc.
        </p>

        <div className="w-full mt-2 py-3 px-4 bg-white text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg group-hover:bg-orange-50 transition-colors">
          Publier maintenant
        </div>
      </div>
    </Link>
  );
};
