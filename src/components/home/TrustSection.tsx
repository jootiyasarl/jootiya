"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, HeartHandshake, MapPin, PlusCircle, ArrowRight, CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Sécurisé & Vérifié",
    description:
      "Chaque annonce est contrôlée et vérifiée pour garantir une expérience d'achat sans arnaque ni mauvaise surprise.",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Zap,
    title: "Publication Ultra-Rapide",
    description:
      "Mettez votre article en vente en moins de 2 minutes avec des outils simples et intelligents. 100% gratuit.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
  },
  {
    icon: MapPin,
    title: "Proximité & Localisation",
    description:
      "Achetez et vendez directement dans votre quartier ou votre ville partout au Maroc sans frais intermédiaires.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: HeartHandshake,
    title: "Communauté de Confiance",
    description:
      "Profils vérifiés, avis clients réels et messagerie instantanée directe pour échanger en toute sérénité.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
  },
];

export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider mb-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pourquoi choisir Jootiya ?
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            La marketplace pensée pour{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              votre tranquillité
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Une plateforme moderne, rapide et transparente pour acheter et vendre au Maroc.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative flex flex-col p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`h-12 w-12 rounded-2xl ${feat.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-sm`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Action Banner */}
        <div className="mt-12 sm:mt-16 rounded-[2rem] bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-10 border border-zinc-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 text-center sm:text-left z-10">
            <h3 className="text-lg sm:text-2xl font-black tracking-tight">
              Rejoignez plus de 100,000 acheteurs et vendeurs
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-xl">
              Donnez une seconde vie à vos objets inutilisés et faites de belles affaires chaque jour.
            </p>
          </div>

          <Link
            href="/poste-annonce"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 shrink-0 z-10"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Déposer une annonce</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
