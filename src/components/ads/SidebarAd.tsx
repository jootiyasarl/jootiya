import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const SidebarAd = () => {
  return (
    <Link
      href="/marketplace/post"
      className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group overflow-hidden"
    >
      <div className="card-body items-center text-center gap-4 p-5">
        <div className="avatar placeholder">
          <div className="bg-white/20 text-white w-14 h-14 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="badge badge-ghost badge-sm text-[10px] uppercase tracking-widest">Jootiya Market</span>
          <h3 className="card-title text-lg font-black leading-tight uppercase">
            Vendez et achetez sur Jootiya
          </h3>
        </div>

        <p className="text-xs font-bold text-primary-content/80 leading-relaxed">
          La meilleure plateforme pour vos petites annonces au Maroc.
        </p>

        <button className="btn btn-secondary w-full mt-1 text-[10px] uppercase tracking-widest font-black shadow-lg">
          Publier maintenant
        </button>
      </div>
    </Link>
  );
};
