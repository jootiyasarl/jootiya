import { Star, User, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null; // Joined buyer profile
}

interface RecentReviewsProps {
    reviews: Review[];
    totalCount: number;
    sellerId: string;
}

export function RecentReviews({ reviews, totalCount, sellerId }: RecentReviewsProps) {
    if (!reviews || reviews.length === 0) return null;

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-zinc-100 mt-6 md:p-6 lg:rounded-3xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900 lg:text-base">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Avis clients
                </h2>
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-zinc-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}</span>
                    <div className="flex text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">({totalCount})</span>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-zinc-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {review.profiles?.avatar_url ? (
                                        <Image
                                            src={review.profiles.avatar_url}
                                            alt={review.profiles.full_name || "Buyer"}
                                            width={24} height={24}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="w-3 h-3 text-zinc-400" />
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-zinc-900 line-clamp-1">{review.profiles?.full_name || "Acheteur"}</p>
                            </div>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-2.5 h-2.5 ${i < review.rating ? "fill-current" : "text-zinc-200"}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-[12px] text-zinc-500 leading-snug line-clamp-2 italic">
                            "{review.comment}"
                        </p>
                    </div>
                ))}
            </div>

            {totalCount > reviews.length && (
                <div className="mt-4 pt-4 border-t border-zinc-50 text-center">
                    <Link href={`/profile/${sellerId}`} className="text-[10px] font-bold text-orange-600 hover:text-orange-700 uppercase tracking-widest flex items-center justify-center gap-1">
                        Voir tout ({totalCount})
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    );
}
