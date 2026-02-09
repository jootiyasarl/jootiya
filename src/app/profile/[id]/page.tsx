import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AdCard } from "@/components/AdCard";
import {
    Star,
    User,
    Calendar,
    MapPin,
    ShieldCheck,
    Award,
    MessageCircle,
    ShoppingBag,
    Users,
    Flag
} from "lucide-react";
import { ReportButton } from "@/components/ads/ReportButton";
import { getServerUser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
    const { id: sellerId } = await params;
    const user = await getServerUser();
    const supabase = createSupabaseServerClient();

    // 1. Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sellerId)
        .single();

    if (profileError || !profile) {
        notFound();
    }

    // 2. Fetch Ads
    const { data: ads } = await supabase
        .from("ads")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    // 3. Fetch Reviews
    const { data: reviews } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, profiles(full_name, avatar_url)")
        .eq("seller_id", sellerId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    // 4. Fetch Stats
    const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: sellerId });
    const avgRating = stats?.[0]?.avg_rating || 0;
    const totalReviews = stats?.[0]?.total_reviews || 0;
    const isTrusted = totalReviews > 10 && avgRating >= 4.5;

    const sellerName = profile.full_name || "Utilisateur Jootiya";
    const memberSince = new Date(profile.created_at).getFullYear();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header / Profile Info */}
            <div className="bg-white border-b border-zinc-200 pt-12 pb-8">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                {profile.avatar_url ? (
                                    <Image src={profile.avatar_url} alt={sellerName} width={128} height={128} className="object-cover w-full h-full" />
                                ) : (
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-zinc-300" />
                                )}
                            </div>
                            {isTrusted && (
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                    <Award className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-2xl md:text-4xl font-black text-zinc-900 flex items-center justify-center md:justify-start gap-2">
                                {sellerName}
                                {isTrusted && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold uppercase tracking-tight">Vendeur vérifié</span>
                                )}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-zinc-500 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Depuis {memberSince}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Identité vérifiée
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Page Header */}
                        <div className="flex items-center gap-4 md:ml-auto">
                            <div className="text-center px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100 min-w-[80px]">
                                <span className="block text-xl font-black text-zinc-900">{avgRating || '-'}</span>
                                <div className="flex justify-center text-yellow-500 mb-0.5">
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            </div>
                            <div className="text-center px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100 min-w-[80px]">
                                <span className="block text-xl font-black text-zinc-900">{ads?.length || 0}</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase">Annonces</span>
                            </div>
                            <ReportButton
                                targetId={sellerId}
                                targetType="user"
                                reporterId={user?.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Ads (8/12) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 mb-6">
                                <ShoppingBag className="w-5 h-5 text-orange-600" />
                                Annonces actives
                            </h2>
                            {ads && ads.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                    {ads?.map((ad) => (
                                        <AdCard
                                            key={ad.id}
                                            ad={{
                                                id: ad.id,
                                                title: ad.title,
                                                price: `${ad.price} ${ad.currency || 'MAD'}`,
                                                location: ad.city,
                                                imageUrl: ad.image_urls?.[0],
                                                createdAt: new Date(ad.created_at).toLocaleDateString()
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
                                    <p className="text-zinc-500 font-medium">Aucune annonce active pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Reviews (4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24">
                            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 mb-6">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                Avis ({totalReviews})
                            </h2>
                            <div className="space-y-4">
                                {reviews && reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                                                        {(() => {
                                                            const buyer = Array.isArray(review.profiles) ? review.profiles[0] : (review.profiles as any);
                                                            return buyer?.avatar_url ? (
                                                                <Image src={buyer.avatar_url} alt="Buyer" width={24} height={24} className="object-cover" />
                                                            ) : (
                                                                <User className="w-3 h-3 text-zinc-300" />
                                                            );
                                                        })()}
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-900">
                                                        {(Array.isArray(review.profiles) ? review.profiles[0] : (review.profiles as any))?.full_name || 'Acheteur'}
                                                    </span>
                                                </div>
                                                <div className="flex text-yellow-500">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="text-xs font-black ml-1 text-zinc-900">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-600 leading-relaxed italic">"{review.comment}"</p>
                                            <span className="text-[10px] text-zinc-400 mt-3 block">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-white rounded-2xl border border-zinc-100">
                                        <p className="text-zinc-500 text-sm">Pas encore d'avis.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
}
