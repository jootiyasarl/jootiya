import AdPostForm from "@/components/ads/AdPostForm";

export default function PostAdPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />
            <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container relative mx-auto px-4 py-12 md:py-20">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-white">
                        Turn Your Items into Cash
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl">
                        Create a listing in seconds and reach thousands of interested buyers on Jootiya.
                    </p>
                </div>

                <AdPostForm />
            </div>
        </div>
    );
}
