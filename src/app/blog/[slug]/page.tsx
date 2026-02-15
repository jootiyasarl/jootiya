import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, Calendar, Tag, Share2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (slug === 'economie-circulaire-maroc-durable') {
    return {
      title: "L'Économie Circulaire au Maroc | Jootiya Blog",
      description: "Pourquoi le re-commerce est l'avenir de la consommation durable au Maroc. Analyse de l'impact écologique et social.",
      keywords: ["Développement Durable", "Économie Verte", "Maroc", "Consommation Responsable"],
      openGraph: {
        title: "L'Économie Circulaire au Maroc : Pourquoi le Re-commerce est l'Avenir de la Consommation Durable",
        description: "Face aux défis environnementaux mondiaux, le Maroc adopte progressivement les principes de l'économie circulaire...",
        images: ["https://ssfcfvuosxxmvsdoktws.supabase.co/storage/v1/object/public/blog/blog_post_2.png"],
      }
    };
  }

  if (slug !== 'ecosysteme-commerce-maroc') return { title: "Article introuvable" };

  return {
    title: "L'Écosystème du Commerce Électronique au Maroc | Jootiya Blog",
    description: "Analyse profonde de l'infrastructure, la logistique et les perspectives 2026 de l'e-commerce au Maroc.",
    keywords: ["E-commerce Maroc", "Transformation Digitale", "Logistique", "Infrastructure"],
    openGraph: {
      title: "L'Écosystème du Commerce Électronique au Maroc : Infrastructure, Logistique et Perspectives 2026",
      description: "Le paysage du commerce numérique au Maroc connaît une mutation profonde...",
      images: ["https://ssfcfvuosxxmvsdoktws.supabase.co/storage/v1/object/public/blog/blog_post_1.png"],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === 'economie-circulaire-maroc-durable') {
    return (
      <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
        {/* Hero Header */}
        <div className="relative h-[60vh] w-full">
          <Image
            src="https://ssfcfvuosxxmvsdoktws.supabase.co/storage/v1/object/public/blog/blog_post_2.png"
            alt="L'Économie Circulaire au Maroc"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl px-4 text-center">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour au blog
              </Link>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                L'Économie Circulaire au Maroc : Pourquoi le Re-commerce est l'Avenir de la Consommation Durable
              </h1>
              <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  15 Février 2026
                </span>
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-400" />
                  Consommation Durable
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="prose prose-lg prose-zinc max-w-none">
            <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-green-500 pl-6 py-2 bg-green-50/30">
              Face aux défis environnementaux mondiaux et à la nécessité d'une gestion plus rationnelle des ressources, le Maroc adopte progressivement les principes de l'économie circulaire. Ce modèle, fondé sur la réutilisation et la valorisation des produits, trouve un écho particulier dans le secteur du commerce digital. Des initiatives comme Jootiya illustrent parfaitement comment la technologie peut transformer le marché de l'occasion en un levier de développement durable et de croissance économique responsable.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">1. Réduction de l'Empreinte Carbone et Consommation Responsable</h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              Le concept de "Re-commerce" (commerce de seconde main) joue un rôle crucial dans la réduction de l'empreinte carbone au niveau national. En prolongeant le cycle de vie des produits — qu'il s'agisse de textile, d'électronique ou de mobilier — nous diminuons la pression sur la production de nouvelles matières premières. Cette approche de consommation responsable permet non seulement de préserver l'environnement, mais aussi de sensibiliser les citoyens marocains aux enjeux du recyclage et de la valorisation.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">2. Impact Social et Optimisation du Pouvoir d'Achat</h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              L'économie circulaire au Maroc n'est pas uniquement un enjeu écologique, c'est aussi un puissant vecteur social. En structurant le marché de l'occasion via des plateformes numériques sécurisées, nous permettons à une large frange de la population d'accéder à des biens de qualité à des tarifs compétitifs. Cette optimisation du pouvoir d'achat s'inscrit dans une logique d'inclusion numérique, où chaque transaction contribue à la pérennité d'un écosystème local et solidaire.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">3. Vers une Standardisation de la Qualité dans le Marché de l'Occasion</h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              L'un des plus grands défis de l'économie circulaire est la garantie de la qualité. Grâce à l'innovation technologique et à la transparence des données, il est désormais possible de standardiser les échanges. Les mécanismes de notation et les descriptions détaillées sur les plateformes modernes permettent de lever les barrières de la méfiance, transformant la "Jootiya" traditionnelle en un marché digitalisé, fiable et conforme aux standards internationaux de "Consumer Trust" (confiance du consommateur).
            </p>

            <div className="bg-zinc-50 rounded-3xl p-8 mt-16 border border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-0">Conclusion</h2>
              <p className="text-zinc-700 leading-relaxed m-0 italic">
                En définitive, le re-commerce structuré représente une opportunité majeure pour le Maroc. En alliant innovation digitale et principes de durabilité, Jootiya participe activement à l'émergence d'une économie plus verte et plus résiliente, prouvant que le commerce de demain sera nécessairement circulaire ou ne sera pas.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-2">
              {["Développement Durable", "Économie Verte", "Maroc", "Consommation Responsable"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-full uppercase tracking-tighter">
                  #{tag.replace(' ', '')}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-bold">Partager</span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (slug !== 'ecosysteme-commerce-maroc') {
    notFound();
  }

  return (
    <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full">
        <Image
          src="https://ssfcfvuosxxmvsdoktws.supabase.co/storage/v1/object/public/blog/blog_post_1.png"
          alt="L'Écosystème du Commerce Électronique au Maroc"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl px-4 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              L'Écosystème du Commerce Électronique au Maroc : Infrastructure, Logistique et Perspectives 2026
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                15 Février 2026
              </span>
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-400" />
                Analyse Stratégique
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="prose prose-lg prose-zinc max-w-none">
          <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-orange-500 pl-6 py-2 bg-orange-50/30">
            Le paysage du commerce numérique au Maroc connaît une mutation profonde, portée par une accélération sans précédent de la digitalisation. Dans ce contexte, la structuration des échanges, qu'ils soient de produits neufs ou d'occasion, devient un enjeu économique majeur. Des plateformes comme Jootiya se positionnent désormais au centre de cette transformation, offrant une infrastructure fiable pour dynamiser le marché local tout en répondant aux nouvelles exigences de transparence et de sécurité des consommateurs.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">1. Infrastructure et Modernisation de la Supply Chain</h2>
          <p className="text-zinc-700 leading-relaxed mb-8">
            Le succès de l'e-commerce au Maroc repose sur une "Supply Chain" (chaîne d'approvisionnement) de plus en plus résiliente. L'intégration de solutions logistiques avancées permet aujourd'hui de réduire les délais de livraison et d'optimiser les flux entre les grandes métropoles comme Casablanca, Tanger et Marrakech. Pour une plateforme de "Marketplace", l'efficacité de cette infrastructure est le garant d'une expérience utilisateur fluide, essentielle pour instaurer une confiance durable dans les transactions numériques.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">2. Transformation Digitale et Confiance des Consommateurs</h2>
          <p className="text-zinc-700 leading-relaxed mb-8">
            La confiance est le pilier de l'économie digitale. Le passage d'un marché traditionnel vers des plateformes structurées permet d'éliminer l'asymétrie d'information. Grâce à des protocoles de vérification et à une meilleure présentation des données produits, le "Market Valuation" (valorisation du marché) devient plus précis. Cette digitalisation n'est pas qu'une simple tendance, mais une nécessité pour les auto-entrepreneurs marocains qui cherchent à élargir leur portée commerciale.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">3. Analyse du Marché et Impact Économique</h2>
          <p className="text-zinc-700 leading-relaxed mb-8">
            En 2026, le secteur de la vente au détail en ligne représente une part croissante du PIB national. L'analyse des tendances montre une forte demande pour les solutions de "Re-commerce" (commerce de seconde main structuré). Ce segment, en pleine expansion, attire des investissements technologiques majeurs, transformant la manière dont les Marocains perçoivent la valeur des biens durables.
          </p>

          <div className="bg-zinc-50 rounded-3xl p-8 mt-16 border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-0">Conclusion</h2>
            <p className="text-zinc-700 leading-relaxed m-0 italic">
              En conclusion, l'avenir du commerce au Maroc réside dans l'équilibre entre technologie de pointe et proximité humaine. Jootiya s'inscrit dans cette vision en proposant une plateforme qui n'est pas seulement un lieu d'échange, mais un véritable moteur de l'économie circulaire et numérique du Royaume.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex gap-2">
            {["E-commerce Maroc", "Transformation Digitale", "Logistique", "Infrastructure"].map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-full uppercase tracking-tighter">
                #{tag.replace(' ', '')}
              </span>
            ))}
          </div>
          <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-bold">Partager</span>
          </button>
        </div>
      </div>
    </article>
  );
}
