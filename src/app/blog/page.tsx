import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "Blog - Actualités et Analyses du Marché Marocain | Jootiya",
  description: "Découvrez nos derniers articles sur l'e-commerce, la logistique et la transformation digitale au Maroc.",
};

const blogPosts = [
  {
    title: "Guide de l'Entrepreneuriat Digital au Maroc : Comment Réussir dans le Secteur du E-commerce en 2026",
    slug: "guide-entrepreneuriat-digital-maroc",
    excerpt: "L'entrepreneuriat au Maroc vit un âge d'or, propulsé par une jeunesse dynamique et un écosystème digital en pleine mutation...",
    date: "15 Février 2026",
    category: "Entrepreneuriat",
    image: "/blog/Entrepreneuriat.png"
  },
  {
    title: "La Révolution du Paiement Digital au Maroc : Vers un Écosystème de Commerce Sans Cash",
    slug: "paiement-digital-ecommerce-maroc",
    excerpt: "Le secteur financier marocain traverse une phase de transformation historique, marquée par une transition accélérée vers le paiement numérique...",
    date: "15 Février 2026",
    category: "Fintech",
    image: "/blog/wallet.png"
  },
  {
    title: "L'Impact de la Technologie et de l'Intelligence Artificielle sur le Commerce Mobile au Maroc",
    slug: "technologie-intelligence-artificielle-commerce-maroc",
    excerpt: "Le marché du 'Mobile Commerce' (m-commerce) au Maroc connaît une croissance exponentielle, portée par une pénétration massive des smartphones...",
    date: "15 Février 2026",
    category: "Technologie",
    image: "/blog/tech-savvy.jpg"
  },
  {
    title: "L'Économie Circulaire au Maroc : Pourquoi le Re-commerce est l'Avenir de la Consommation Durable",
    slug: "economie-circulaire-maroc-durable",
    excerpt: "Face aux défis environnementaux mondiaux et à la nécessité d'une gestion plus rationnelle des ressources, le Maroc adopte progressivement les principes de l'économie circulaire...",
    date: "15 Février 2026",
    category: "Durabilité",
    image: "/blog/economie-verte.jpg"
  },
  {
    title: "L'Écosystème du Commerce Électronique au Maroc : Infrastructure, Logistique et Perspectives 2026",
    slug: "ecosysteme-commerce-maroc",
    excerpt: "Le paysage du commerce numérique au Maroc connaît une mutation profonde, portée par une accélération sans précédent de la digitalisation...",
    date: "15 Février 2026",
    category: "Analyse",
    image: "/blog/e commerce.png"
  }
];

export default function BlogListing() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Blog & Perspectives
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Analyses stratégiques et actualités du marché marocain.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="flex flex-col overflow-hidden rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow bg-white">
              <Link href={`/blog/${post.slug}`} className="flex-shrink-0 relative h-64 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between p-6 bg-white relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">
                    {post.category}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <h2 className="text-xl font-bold text-zinc-900 group-hover:text-orange-600 transition-colors leading-tight mb-3">
                      {post.title}
                    </h2>
                    <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </Link>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center">
                  <div className="text-xs text-zinc-400 font-medium">
                    <time dateTime="2026-02-15">{post.date}</time>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
