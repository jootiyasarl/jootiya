import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                        Conseils de <span className="text-orange-600">Sécurité</span>
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                        Chez Jootiya, votre sécurité est notre priorité absolue. Voici nos conseils pour une expérience d'achat et de vente sereine au Maroc.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <SafetyCard 
                        icon={<Eye className="w-8 h-8 text-blue-500" />}
                        title="Vérifiez l'article"
                        description="Ne payez jamais avant d'avoir vu et testé l'article en personne. C'est la règle d'or pour éviter toute déception."
                    />
                    <SafetyCard 
                        icon={<Shield className="w-8 h-8 text-emerald-500" />}
                        title="Lieu Public"
                        description="Privilégiez toujours les lieux publics et fréquentés pour vos transactions (cafés, gares, centres commerciaux)."
                    />
                    <SafetyCard 
                        icon={<Lock className="w-8 h-8 text-purple-500" />}
                        title="Paiement Sécurisé"
                        description="Soyez prudent avec les virements bancaires à l'avance. Le paiement en espèces lors de la remise en main propre est recommandé."
                    />
                    <SafetyCard 
                        icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
                        title="Signalez les abus"
                        description="Si une offre semble trop belle pour être vraie ou si un utilisateur se comporte de manière suspecte, signalez-le nous immédiatement."
                    />
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Besoin d'aide ?</h2>
                    <p className="text-zinc-500 mb-8">Notre équipe de modération est à votre disposition 7j/7.</p>
                    <a 
                        href="/contact" 
                        className="inline-flex h-12 px-8 items-center justify-center rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-lg shadow-orange-200 dark:shadow-none"
                    >
                        Contactez le Support
                    </a>
                </div>
            </div>
        </div>
    );
}

function SafetyCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm font-medium">{description}</p>
        </div>
    );
}
