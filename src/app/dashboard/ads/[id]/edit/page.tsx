import { createSupabaseServerClient, getServerUser } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import AdPostForm from "@/components/ads/AdPostForm";

interface EditAdPageProps {
    params: {
        id: string;
    };
}

export default async function EditAdPage({ params }: EditAdPageProps) {
    const { id } = params;
    const user = await getServerUser();

    if (!user) {
        redirect(`/login?redirectTo=/dashboard/ads/${id}/edit`);
    }

    const supabase = createSupabaseServerClient();

    const { data: ad, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", id)
        .eq("seller_id", user.id)
        .single();

    if (error || !ad) {
        notFound();
    }

    // Format location for the form (City, Neighborhood)
    const location = ad.neighborhood ? `${ad.city}, ${ad.neighborhood}` : ad.city || "";

    const initialData = {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        category: ad.category,
        location: location,
        image_urls: ad.image_urls || []
    };

    return (
        <div className="py-10">
            <div className="max-w-4xl mx-auto px-4 mb-8">
                <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Modifier l'annonce</h1>
                <p className="text-zinc-500 font-medium">Mettez à jour les informations de votre article</p>
            </div>
            <AdPostForm mode="edit" initialData={initialData} />
        </div>
    );
}
