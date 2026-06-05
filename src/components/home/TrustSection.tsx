import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "Sécurité et Fiabilité",
        description: "Nous vérifions l'identité des vendeurs et surveillons les annonces pour garantir une expérience sûre pour tous.",
    },
    {
        icon: Zap,
        title: "Vente Rapide",
        description: "Créez votre annonce en quelques minutes et exposez-la à des milliers d'acheteurs potentiels chaque jour.",
    },
    {
        icon: HeartHandshake,
        title: "Communauté Locale",
        description: "Connectez-vous avec vos voisins et les commerçants de votre ville pour acheter et vendre tout ce dont vous avez besoin localement.",
    },
];

export function TrustSection() {
    return (
        <section className="bg-white py-24 sm:py-32 border-t border-zinc-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-orange-600">Pourquoi Jootiya ?</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                        Une expérience d'achat et de vente inégalée
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="card bg-base-100 border border-zinc-200 dark:border-zinc-700 shadow-sm text-center">
                                <div className="card-body items-center">
                                    <span className="flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/30">
                                        <feature.icon className="h-8 w-8" aria-hidden="true" />
                                    </span>
                                    <h3 className="card-title text-zinc-900 dark:text-zinc-100">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
