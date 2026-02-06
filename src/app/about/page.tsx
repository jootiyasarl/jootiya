import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'من نحن - Jootiya',
    description: 'تعرف على jootiya.com، المنصة العربية الرائدة في المغرب.',
};

export default function AboutUsPage() {
    return (
        <div className="bg-white min-h-screen" dir="ltr">
            {/* Dynamic Header */}
            <div className="bg-zinc-900 py-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-600/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                        À propos de <span className="text-orange-500">JOOTIYA</span>
                    </h1>
                    <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                        La plateforme leader qui redéfinit l'expérience d'achat et de vente au Maroc.
                    </p>
                    <div className="w-32 h-2 bg-orange-500 mx-auto mt-12 rounded-full"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24 max-w-5xl animate-fade-in-up">
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="space-y-8 text-lg text-zinc-600 leading-loose text-left">
                        <h2 className="text-4xl font-black text-zinc-900 mb-4 leading-tight">
                            Nous sommes là pour vous <br />
                            <span className="text-orange-500">à chaque étape</span>
                        </h2>
                        <p className="text-xl">
                            <span className="font-black text-zinc-900">jootiya.com</span> n'est pas seulement un marché en ligne, c'est une communauté intégrée qui vise à faciliter la vie des utilisateurs marocains.
                        </p>
                        <p>
                            Nous croyons au pouvoir de l'information correcte et de la transparence, et nous nous efforçons de fournir un environnement fiable et sécurisé pour vous permettre de trouver ce que vous cherchez avec un minimum d'effort et au meilleur prix.
                        </p>
                        <p className="p-6 bg-zinc-50 border-l-8 border-orange-500 rounded-r-3xl italic text-zinc-800">
                            "Notre équipe travaille 24h/24 pour assurer la qualité du contenu et sa conformité aux normes mondiales, en mettant l'accent sur la facilité d'utilisation."
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900 flex flex-col items-center justify-center p-12 text-center text-white">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/5">
                                <span className="text-6xl">🚀</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4">Ambition sans limite</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                Nous aspirons à être le premier choix et la destination de confiance pour chaque Marocain à la recherche d'excellence et de facilité.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-zinc-900 rounded-[4rem] -mx-4 md:-mx-12 py-20 translate-y-20"></div>
                    <div className="relative grid sm:grid-cols-3 gap-12 text-center bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl border border-zinc-100">
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-orange-600 tracking-tighter">+10k</div>
                            <div className="text-zinc-500 font-bold text-xl">Utilisateurs Actifs</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-zinc-900 tracking-tighter">+50k</div>
                            <div className="text-zinc-500 font-bold text-xl">Annonces Publiées</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-blue-600 tracking-tighter">24/7</div>
                            <div className="text-zinc-500 font-bold text-xl">Support Client</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-64"></div> {/* Spacer for stats overlap */}
        </div>
    );
}
