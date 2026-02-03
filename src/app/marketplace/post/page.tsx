import AdPostForm from "@/components/ads/AdPostForm";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function PostAdPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 relative overflow-hidden pb-20">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none" />
            <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-4 pt-16 md:pt-24">
                {/* Header Section */}
                <div className="mb-16 text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-xl shadow-zinc-200/50 border border-zinc-50 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Vendez plus rapidement sur Jootiya</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.9]">
                        Donnez une seconde <br />
                        <span className="text-blue-600">vie à vos objets</span>
                    </h1>

                    <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                        Rejoignez des milliers de vendeurs et touchez des acheteurs partout au Maroc en quelques minutes.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-8 pt-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Paiement Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vente Rapide</span>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="relative z-10">
                    <AdPostForm />
                </div>

                {/* FAQ / Info Footer */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="p-8 rounded-[2rem] bg-white shadow-lg shadow-zinc-100 border border-zinc-50">
                        <h4 className="font-black text-zinc-900 uppercase tracking-tight mb-3">Est-ce gratuit ?</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">Oui, la publication d'annonces standard est entièrement gratuite pour tous les utilisateurs.</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white shadow-lg shadow-zinc-100 border border-zinc-50">
                        <h4 className="font-black text-zinc-900 uppercase tracking-tight mb-3">Temps de validation</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">Nos modérateurs vérifient chaque annonce en moins de 2 heures pour garantir la qualité.</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white shadow-lg shadow-zinc-100 border border-zinc-50">
                        <h4 className="font-black text-zinc-900 uppercase tracking-tight mb-3">Conseils photo</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">Utilisez une lumière naturelle et montrez l'objet sous plusieurs angles pour vendre 2x plus vite.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
