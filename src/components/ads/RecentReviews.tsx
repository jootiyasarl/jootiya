import { Star, User } from "lucide-react";
import Image from "next/image";

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
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 sm:p-8 mt-8">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-zinc-900">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Ce que disent les acheteurs
            </h2>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-zinc-50 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                                    {review.profiles?.avatar_url ? (
                                        <Image
                                            src={review.profiles.avatar_url}
                                            alt={review.profiles.full_name || "Buyer"}
                                            width={32} height={32}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">{review.profiles?.full_name || "Acheteur Jootiya"}</p>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-zinc-200"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-zinc-400">
                                {new Date(review.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-600 leading-relaxed italic">
                            "{review.comment}"
                        </p>
                    </div>
                ))}
            </div>

            {totalCount > reviews.length && (
                <div className="mt-6 pt-6 border-t border-zinc-50 text-center">
                    <a href={`/profile/${sellerId}`} className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                        Voir les {totalCount} avis
                        <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            )}
        </div>
    );
}
