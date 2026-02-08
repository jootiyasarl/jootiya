import AdPostForm from "@/components/ads/AdPostForm";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function PostAdPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 relative overflow-hidden pb-20">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-900/10 dark:to-transparent pointer-events-none" />
            <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-400/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-4 pt-16 md:pt-24">
                {/* Header Section */}
                <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-zinc-100 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900">Vendez sur Jootiya</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                        Donnez une seconde <span className="text-orange-600">vie à vos objets</span>
                    </h1>

                    <p className="text-zinc-500 text-base md:text-lg font-medium max-w-lg mx-auto leading-relaxed">
                        Rejoignez des milliers de vendeurs et touchez des acheteurs partout au Maroc.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-6 pt-2">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Paiement Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Vente Rapide</span>
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
