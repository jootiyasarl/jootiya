import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, Calendar, Tag, Share2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (slug === 'guide-entrepreneuriat-digital-maroc') {
    return {
      title: "Guide de l'Entrepreneuriat Digital au Maroc | Jootiya Blog",
      description: "Comment réussir son projet e-commerce au Maroc en 2026. Stratégies, marketing digital et scalabilité pour les entrepreneurs.",
      keywords: ["Entrepreneuriat", "Business Maroc", "E-commerce 2026", "Auto-entrepreneur", "Succès Digital"],
      openGraph: {
        title: "Guide de l'Entrepreneuriat Digital au Maroc : Comment Réussir dans le Secteur du E-commerce en 2026",
        description: "L'entrepreneuriat au Maroc vit un âge d'or. Découvrez les clés du succès pour réussir dans le marché numérique...",
        images: ["/blog/Entrepreneuriat.png"],
      }
    };
  }

  if (slug === 'paiement-digital-ecommerce-maroc') {
    return {
      title: "La Révolution du Paiement Digital au Maroc | Jootiya Blog",
      description: "Analyse de la transition vers le paiement numérique au Maroc. Impact des M-wallets et de l'inclusion financière sur l'e-commerce.",
      keywords: ["Fintech", "Paiement Electronique", "Banque Digital", "Maroc", "Inclusion Financière"],
      openGraph: {
        title: "La Révolution du Paiement Digital au Maroc : Vers un Écosystème de Commerce Sans Cash",
        description: "Le secteur financier marocain traverse une phase de transformation historique...",
        images: ["/blog/wallet.png"],
      }
    };
  }

  if (slug === 'technologie-intelligence-artificielle-commerce-maroc') {
    return {
      title: "L'Impact de la Technologie et de l'IA sur le Commerce au Maroc | Jootiya Blog",
      description: "Analyse de l'impact de l'intelligence artificielle et du M-commerce sur le marché marocain. Sécurité, personnalisation et performance.",
      keywords: ["Intelligence Artificielle", "M-Commerce", "Technologie", "Maroc", "Sécurité Digitale"],
      openGraph: {
        title: "L'Impact de la Technologie et de l'Intelligence Artificielle sur le Commerce Mobile au Maroc",
        description: "Comment l'IA et les nouvelles technologies transforment l'expérience d'achat des Marocains...",
        images: ["/blog/tech-savvy.jpg"],
      }
    };
  }

  if (slug === 'economie-circulaire-maroc-durable') {
    return {
      title: "L'Économie Circulaire au Maroc | Jootiya Blog",
      description: "Pourquoi le re-commerce est l'avenir de la consommation durable au Maroc. Analyse de l'impact écologique et social.",
      keywords: ["Développement Durable", "Économie Verte", "Maroc", "Consommation Responsable"],
      openGraph: {
        title: "L'Économie Circulaire au Maroc : Pourquoi le Re-commerce est l'Avenir de la Consommation Durable",
        description: "Face aux défis environnementaux mondiaux, le Maroc adopte progressivement les principes de l'économie circulaire...",
        images: ["/blog/economie-verte.jpg"],
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
      images: ["/blog/e commerce.png"],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === 'guide-entrepreneuriat-digital-maroc') {
    return (
      <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
        {/* Hero Header */}
        <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
          <Image
            src="/blog/Entrepreneuriat.png"
            alt="Entrepreneuriat Digital au Maroc"
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
          <div className="relative z-10 max-w-4xl px-4 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              Guide de l'Entrepreneuriat Digital au Maroc : Comment Réussir dans le Secteur du E-commerce en 2026
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-lg">
                <Calendar className="w-4 h-4" />
                15 Février 2026
              </span>
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Tag className="w-4 h-4" />
                Entrepreneuriat
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="prose prose-lg prose-zinc max-w-none">
            <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-purple-500 pl-6 py-2 bg-purple-50/30">
              L'entrepreneuriat au Maroc vit un âge d'or, propulsé par une jeunesse dynamique et un écosystème digital en pleine mutation. Le secteur du commerce électronique offre des opportunités sans précédent.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
              Identifier le "Product-Market Fit"
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-6">
              La première étape vers la réussite est de comprendre les besoins réels du consommateur marocain en identifiant :
            </p>
            <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
              <li><strong>Les niches spécifiques</strong> dans les technologies ou la mode.</li>
              <li><strong>Les solutions concrètes</strong> aux problèmes existants.</li>
              <li><strong>Les outils digitaux</strong> pour maximiser la visibilité.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Stratégie de Marque et Digital Marketing
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              Construire une marque forte basée sur la crédibilité et la transparence est essentiel pour bâtir une communauté fidèle et optimiser le ROI.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
              Scalabilité et Plateformes de Support
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              Les plateformes structurées jouent un rôle de catalyseur en offrant l'infrastructure nécessaire pour passer d'un projet local à une entreprise d'envergure nationale.
            </p>

            <div className="bg-zinc-50 rounded-3xl p-8 mt-16 border border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-0">Conclusion</h2>
              <p className="text-zinc-700 leading-relaxed m-0 italic">
                Le chemin vers le succès digital au Maroc nécessite de la persévérance, de l'innovation et une utilisation judicieuse des technologies. Avec un cadre économique de plus en plus favorable et des outils digitaux performants, chaque citoyen porteur d'une idée peut devenir un acteur clé de l'économie numérique de demain. Jootiya s'engage à être le partenaire de cette ambition, en offrant un espace où l'entrepreneuriat rencontre la technologie.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-2">
              {["Entrepreneuriat", "Business Maroc", "E-commerce 2026", "Auto-entrepreneur", "Succès Digital"].map(tag => (
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

  if (slug === 'paiement-digital-ecommerce-maroc') {
    return (
      <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
        {/* Hero Header */}
        <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
          <Image
            src="/blog/wallet.png"
            alt="Paiement Digital au Maroc"
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
          <div className="relative z-10 max-w-4xl px-4 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              La Révolution du Paiement Digital au Maroc : Vers un Écosystème de Commerce Sans Cash
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-lg">
                <Calendar className="w-4 h-4" />
                15 Février 2026
              </span>
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Tag className="w-4 h-4" />
                Fintech & Économie
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="prose prose-lg prose-zinc max-w-none">
            <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-yellow-500 pl-6 py-2 bg-yellow-50/30">
              Le paysage financier marocain traverse une phase de transformation historique, marquée par une transition accélérée vers le paiement numérique et l'inclusion financière.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
              L'Essor des M-Wallets et de l'Inclusion Financière
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-6">
              Le déploiement des portefeuilles mobiles au Maroc a ouvert de nouvelles perspectives grâce à :
            </p>
            <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
              <li><strong>Transactions instantanées</strong> et sécurisées via smartphone.</li>
              <li><strong>Réduction des barrières</strong> d'accès aux services bancaires.</li>
              <li><strong>Meilleure traçabilité</strong> des flux financiers pour les commerçants.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Sécurité et Confiance dans le Paiement en Ligne
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              L'adoption de protocoles de cryptage avancés (SSL, 3D Secure) garantit une expérience d'achat conforme aux standards internationaux de Cybersecurity.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
              L'Impact sur l'Économie Locale
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              La dématérialisation des paiements stimule l'économie formelle et renforce la position du Maroc comme hub technologique régional.
            </p>

            <div className="bg-zinc-50 rounded-3xl p-8 mt-16 border border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-0">Conclusion</h2>
              <p className="text-zinc-700 leading-relaxed m-0 italic">
                Le futur du commerce au Maroc est indissociable du futur du paiement digital. En accompagnant ses utilisateurs dans l'adoption de solutions de paiement modernes et sécurisées, Jootiya participe activement à la modernisation du tissu économique marocain, prouvant que la technologie financière est le moteur indispensable d'un commerce prospère et inclusif.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-2">
              {["Fintech", "Paiement Electronique", "Banque Digital", "Maroc", "Inclusion Financière"].map(tag => (
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

  if (slug === 'technologie-intelligence-artificielle-commerce-maroc') {
    return (
      <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
        {/* Hero Header */}
        <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
          <Image
            src="/blog/tech-savvy.jpg"
            alt="Technologie et IA dans le commerce au Maroc"
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
          <div className="relative z-10 max-w-4xl px-4 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              L'Impact de la Technologie et de l'Intelligence Artificielle sur le Commerce Mobile au Maroc
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-lg">
                <Calendar className="w-4 h-4" />
                15 Février 2026
              </span>
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Tag className="w-4 h-4" />
                Tech & Innovation
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="prose prose-lg prose-zinc max-w-none">
            <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/30">
              Le marché du "Mobile Commerce" (m-commerce) au Maroc connaît une croissance exponentielle, portée par une pénétration massive des smartphones. L'IA et l'analyse de données redéfinissent aujourd'hui l'expérience d'achat moderne.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
              Personnalisation de l'Expérience Client via l'IA
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-6">
              L'IA permet de transformer la recherche de produits en une expérience sur mesure. Ses piliers incluent :
            </p>
            <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
              <li><strong>Algorithmes de recommandation</strong> sophistiqués.</li>
              <li><strong>Analyse prédictive</strong> des comportements d'achat.</li>
              <li><strong>Contenu ciblé</strong> augmentant l'engagement client.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Sécurité des Transactions
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              L'adoption de protocoles de sécurité basés sur l'IA permet de détecter les fraudes en temps réel et de garantir l'intégrité totale des échanges.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
              L'Optimisation Mobile (UX/UI)
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              Avec 80% des recherches effectuées sur mobile, une interface fluide et des temps de chargement rapides sont les clés de la visibilité sur les moteurs de recherche.
            </p>

            <div className="bg-zinc-50 rounded-3xl p-8 mt-16 border border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-0">Conclusion</h2>
              <p className="text-zinc-700 leading-relaxed m-0 italic">
                La révolution technologique dans le commerce au Maroc ne fait que commencer. En adoptant les dernières innovations en matière d'IA et de sécurité mobile, Jootiya ne se contente pas de suivre la tendance, mais participe activement à la construction d'un écosystème e-commerce moderne, sécurisé et ultra-performant pour tous les Marocains.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-2">
              {["Intelligence Artificielle", "M-Commerce", "Technologie", "Maroc", "Sécurité Digitale"].map(tag => (
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

  if (slug === 'economie-circulaire-maroc-durable') {
    return (
      <article dir="ltr" className="min-h-screen bg-white pb-20 font-sans">
        {/* Hero Header */}
        <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
          <Image
            src="/blog/economie-verte.jpg"
            alt="L'Économie Circulaire au Maroc"
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
          <div className="relative z-10 max-w-4xl px-4 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              L'Économie Circulaire au Maroc : Pourquoi le Re-commerce est l'Avenir de la Consommation Durable
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-lg">
                <Calendar className="w-4 h-4" />
                15 Février 2026
              </span>
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Tag className="w-4 h-4" />
                Consommation Durable
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="prose prose-lg prose-zinc max-w-none">
            <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-green-500 pl-6 py-2 bg-green-50/30">
              Face aux défis environnementaux mondiaux et à la nécessité d'une gestion plus rationnelle des ressources, le Maroc adopte progressivement les principes de l'économie circulaire. Des initiatives comme Jootiya illustrent parfaitement comment la technologie peut transformer le marché de l'occasion en un levier de développement durable.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
              Réduction de l'Empreinte Carbone et Consommation Responsable
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-6">
              Le concept de <strong>Re-commerce</strong> joue un rôle crucial dans la stratégie écologique nationale. Ses avantages incluent :
            </p>
            <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
              <li><strong>Prolongement du cycle de vie</strong> des produits technologiques et textiles.</li>
              <li><strong>Diminution de la pression</strong> sur les ressources naturelles vierges.</li>
              <li><strong>Sensibilisation active</strong> des citoyens aux enjeux du recyclage.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Impact Social et Optimisation du Pouvoir d'Achat
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              L'économie circulaire est un puissant vecteur social qui permet d'accéder à des biens de qualité à des tarifs compétitifs, favorisant ainsi l'inclusion numérique.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
              Vers une Standardisation de la Qualité
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-8">
              Grâce à l'innovation technologique, il est désormais possible de garantir la transparence des données et de standardiser les échanges sur le marché de l'occasion.
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
      <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
        <Image
          src="/blog/e commerce.png"
          alt="L'Écosystème du Commerce Électronique au Maroc"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
        <div className="relative z-10 max-w-4xl px-4 text-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au blog
          </Link>
          <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
            L'Écosystème du Commerce Électronique au Maroc : Infrastructure, Logistique et Perspectives 2026
          </h1>
          <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-lg">
              <Calendar className="w-4 h-4" />
              15 Février 2026
            </span>
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <Tag className="w-4 h-4" />
              Analyse Stratégique
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="prose prose-lg prose-zinc max-w-none">
          <p className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-orange-500 pl-6 py-2 bg-orange-50/30">
            Le paysage du commerce numérique au Maroc connaît une mutation profonde, portée par une accélération sans précédent de la digitalisation. Dans ce contexte, la structuration des échanges, qu'ils soient de produits neufs ou d'occasion, devient un enjeu économique majeur.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
            Infrastructure et Modernisation de la Supply Chain
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Le succès de l'e-commerce au Maroc repose sur une "Supply Chain" de plus en plus résiliente. L'intégration de solutions logistiques avancées permet aujourd'hui :
          </p>
          <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
            <li><strong>Réduction des délais</strong> de livraison entre les grandes métropoles.</li>
            <li><strong>Optimisation des flux</strong> logistiques à Casablanca, Tanger et Marrakech.</li>
            <li><strong>Amélioration de la traçabilité</strong> des colis pour une transparence totale.</li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
            Transformation Digitale et Confiance des Consommateurs
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            La confiance est le pilier de l'économie digitale. Le passage d'un marché traditionnel vers des plateformes structurées permet d'éliminer l'asymétrie d'information grâce à :
          </p>
          <ul className="list-disc pl-6 space-y-3 text-zinc-700 mb-8">
            <li><strong>Protocoles de vérification</strong> rigoureux pour les vendeurs.</li>
            <li><strong>Valorisation précise</strong> du marché (Market Valuation).</li>
            <li><strong>Inclusion des auto-entrepreneurs</strong> dans l'économie formelle.</li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
            Analyse du Marché et Impact Économique
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-8">
            En 2026, le secteur de la vente au détail en ligne représente une part croissante du PIB national. L'analyse des tendances montre une forte demande pour les solutions de <strong>Re-commerce</strong>.
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
