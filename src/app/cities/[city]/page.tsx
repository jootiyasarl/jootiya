import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Cloud, Clock, MapPin, ChevronRight, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MOROCCAN_CITIES } from '@/lib/constants/cities';
import { supabase } from '@/lib/supabaseClient';

interface Props {
    params: Promise<{ city: string }>;
}

function getCityData(citySlug: string) {
    const decodedCity = decodeURIComponent(citySlug);
    for (const region of MOROCCAN_CITIES) {
        const foundCity = region.cities.find(c => c.toLowerCase() === decodedCity.toLowerCase() || c === decodedCity);
        if (foundCity) {
            // Find neighbors (other cities in same region)
            const neighbors = region.cities.filter(c => c !== foundCity);
            return { name: foundCity, region: region.region, neighbors };
        }
    }
    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city } = await params;
    const cityData = getCityData(city);
    if (!cityData) return { title: 'Ville non trouvée' };

    return {
        title: `بيع وشراء في ${cityData.name} | أوقات الصلاة والطقس - Jootiya`,
        description: `اكتشف أفضل العروض والهمزات في ${cityData.name}. سوق ${cityData.name} المفتوح لبيع وشراء السيارات، الهواتف، والعقارات. تابع أيضاً أوقات الصلاة وحالة الطقس في ${cityData.name}.`,
    };
}

export default async function CityLandingPage({ params }: Props) {
    const { city } = await params;
    const cityData = getCityData(city);

    if (!cityData) notFound();

    // Fetch some recent ads for this city with robust filtering
    const { data: recentAds } = await supabase
        .from('ads')
        .select('*')
        .eq('city', cityData.name)
        .in('status', ['active', 'approved'])
        .order('created_at', { ascending: false })
        .limit(12);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `Jootiya ${cityData.name}`,
        "description": `سوق ${cityData.name} المفتوح: همزات، أوقات الصلاة، وأخبار السوق في ${cityData.name}`,
        "url": `https://jootiya.com/cities/${city}`,
        "logo": "https://jootiya.com/favicon.svg",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": cityData.name,
            "addressCountry": "MA"
        },
        "areaServed": {
            "@type": "City",
            "name": cityData.name
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* JSON-LD for City */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header Widget - 40px Height */}
            <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center overflow-hidden">
                <div className="container mx-auto px-4 max-w-[600px] flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span>الصلاة: --:--</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Cloud className="w-3 h-3 text-blue-500" />
                            <span>الطقس: 22°C</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{cityData.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content - Constrained to 600px for Mobile focus */}
            <main className="container mx-auto px-4 max-w-[600px] pt-8 space-y-8">
                {/* Dynamic SEO Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        سوق <span className="text-orange-600">{cityData.name}</span> المفتوح
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                        اكتشف آخر إعلانات البيع والشراء في مدينة {cityData.name}. همزات حصرية، سيارات، هواتف وعقارات.
                    </p>
                </div>

                {/* Call to Action */}
                <div className="bg-orange-600 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-200 dark:shadow-none flex items-center justify-between group">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black uppercase tracking-tight">Vendre à {cityData.name}</h2>
                        <p className="text-xs text-orange-100 font-medium">Publiez votre annonce gratuitement</p>
                    </div>
                    <Link 
                        href="/marketplace/post" 
                        className="bg-white text-orange-600 p-3 rounded-2xl hover:scale-110 transition-transform active:scale-95 shadow-lg"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Link>
                </div>

                {/* Ads Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            Dernières Annonces
                        </h2>
                        <Link href={`/marketplace?city=${cityData.name}`} className="text-xs font-bold text-orange-600 hover:underline">
                            Voir tout
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {recentAds && recentAds.length > 0 ? (
                            recentAds.map((ad) => (
                                <Link key={ad.id} href={`/ads/${ad.id}`} className="group space-y-3">
                                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform group-hover:scale-[1.02]">
                                        {ad.image_urls?.[0] ? (
                                            <Image 
                                                src={ad.image_urls[0]} 
                                                alt={`${ad.title} في ${cityData.name}`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-300">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 px-1 text-right" dir="rtl">
                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{ad.title}</h3>
                                        <p className="text-sm font-black text-orange-600">{ad.price} {ad.currency || 'MAD'}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 py-12 text-center bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-sm text-zinc-400 font-bold">Aucune annonce pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Internal Linking: Neighbors */}
                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Villes Voisines</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {cityData.neighbors.slice(0, 6).map((neighbor) => (
                            <Link 
                                key={neighbor}
                                href={`/cities/${neighbor.toLowerCase()}`}
                                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                            >
                                {neighbor}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer Semantic Text */}
                <div className="text-center pt-8">
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed max-w-[400px] mx-auto">
                        Jootiya هو دليلك في المغرب لمعرفة آخر الهمزات وتوقيت المدن المغربية. نحن نسهل عليك الوصول لأفضل الصفقات في {cityData.name} بكل أمان وسهولة.
                    </p>
                </div>
            </main>
        </div>
    );
}
