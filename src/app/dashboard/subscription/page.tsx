import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    description: "Pour commencer à vendre vos articles",
    features: ["5 annonces actives", "Photos standard", "Support par email", "Statistiques basiques"],
    buttonText: "Plan actuel",
    current: true,
  },
  {
    name: "Pro",
    price: "199",
    description: "Pour les vendeurs sérieux",
    features: ["Annonces illimitées", "Photos HD", "Badge 'Vendeur Vérifié'", "Statistiques avancées", "Mise en avant (3/mois)"],
    buttonText: "Passer au Pro",
    current: false,
    highlight: true,
  },
  {
    name: "Business",
    price: "499",
    description: "Pour les boutiques et professionnels",
    features: ["Tout du plan Pro", "Support prioritaire 24/7", "API d'intégration", "Gestion d'équipe", "Mise en avant illimitée"],
    buttonText: "Contacter la vente",
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Abonnements</h1>
          <p className="mt-2 text-zinc-500">Choisissez le plan qui correspond le mieux à vos besoins de vente.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.highlight ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : ''}`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
                  Recommandé
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-zinc-500">DH/mois</span>
                </div>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-zinc-600">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.highlight ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-white p-8 border text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Zap className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900">Besoin d'un plan personnalisé ?</h2>
          <p className="mt-2 text-zinc-500">
            Nous proposons des solutions sur mesure pour les grandes entreprises et les réseaux de franchises.
          </p>
          <Button variant="link" className="mt-4 text-orange-600">
            Contactez notre équipe commerciale
          </Button>
        </div>
      </div>
    </div>
  );
}
