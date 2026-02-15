import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'À propos de nous - Jootiya',
    description: 'Découvrez jootiya.com, la plateforme leader au Maroc.',
};

export default function AboutUsPage() {
    return (
        <div className="bg-white min-h-screen" dir="ltr">
            {/* Dynamic Header */}
            <div className="bg-zinc-900 py-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-600/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                        À Propos de <span className="text-orange-500 uppercase">Jootiya</span>
                    </h1>
                    <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                        La plateforme de référence dédiée à la transformation digitale du commerce au Maroc.
                    </p>
                    <div className="w-32 h-2 bg-orange-500 mx-auto mt-12 rounded-full shadow-lg shadow-orange-500/20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24 max-w-5xl animate-fade-in-up">
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="space-y-8 text-lg text-zinc-600 leading-loose text-left">
                        <h2 className="text-4xl font-black text-zinc-900 mb-4 leading-tight">
                            Moderniser <br />
                            <span className="text-orange-500">l'économie locale</span>
                        </h2>
                        <p className="text-xl">
                            Né d'une ambition forte de moderniser l'économie circulaire et de soutenir l'inclusion financière, <span className="font-black text-zinc-900">Jootiya</span> n'est pas seulement une marketplace, c'est un écosystème d'innovation.
                        </p>
                        <p>
                            Notre mission est de fournir aux entrepreneurs et aux consommateurs marocains des outils technologiques de pointe, allant de l'intelligence artificielle appliquée au e-commerce jusqu'aux solutions de paiement digital sécurisées.
                        </p>
                        <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 space-y-6">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Nos Valeurs</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">01</span>
                                    <p><span className="font-bold text-zinc-900">Innovation :</span> Intégrer les dernières technologies pour simplifier les échanges.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">02</span>
                                    <p><span className="font-bold text-zinc-900">Durabilité :</span> Promouvoir l'économie circulaire pour un Maroc plus vert.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">03</span>
                                    <p><span className="font-bold text-zinc-900">Confiance :</span> Garantir un environnement sécurisé et transparent pour tous nos utilisateurs.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900 flex flex-col items-center justify-center p-12 text-center text-white">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/5">
                                <span className="text-6xl">🚀</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4">Le Futur du Commerce</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed font-medium italic">
                                "Rejoignez-nous dans cette aventure technologique pour bâtir ensemble le futur du commerce digital au Maroc."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
