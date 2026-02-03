import AdPostForm from "@/components/ads/AdPostForm";

export default function PostAdPage() {
    return (
        <div className="min-h-screen bg-dots-pattern py-12 dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                        Sell Your Items
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Join thousands of sellers and reach a global audience.
                    </p>
                </div>

                <AdPostForm />
            </div>
        </div>
    );
}
