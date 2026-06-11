import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const SidebarAd = () => {
  return (
    <Link
      href="/marketplace/post"
      className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group overflow-hidden"
    >
      <div className="card-body items-center text-center gap-5 p-6">
        <div className="avatar placeholder">
          <div className="bg-white/20 text-white w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="badge badge-ghost badge-sm text-[10px] uppercase tracking-widest border-white/20 text-white/90">Jootiya Market</span>
          <h3 className="card-title text-xl font-black leading-tight uppercase text-white">
            Vendez et achetez sur Jootiya
          </h3>
        </div>

        <p className="text-xs font-bold text-white/80 leading-relaxed">
          La meilleure plateforme pour vos petites annonces au Maroc.
        </p>

        <button className="btn w-full mt-1 text-[10px] uppercase tracking-widest font-black shadow-lg bg-white text-orange-600 hover:bg-orange-50 border-0">
          Publier maintenant
        </button>
      </div>
    </Link>
  );
};
