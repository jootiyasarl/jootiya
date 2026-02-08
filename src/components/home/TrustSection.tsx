import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "أمان وموثوقية",
        description: "نتحقق من هوية البائعين ونراقب الإعلانات لضمان تجربة آمنة لكل المستخدمين.",
    },
    {
        icon: Zap,
        title: "بيع سريع",
        description: "أنشئ إعلانك في دقائق واعرضه أمام آلاف المشترين المحتملين يومياً.",
    },
    {
        icon: HeartHandshake,
        title: "مجتمع محلي",
        description: "تواصل مع جيرانك وتجار مدينتك لبيع وشراء كل ما تحتاجه محلياً.",
    },
];

export function TrustSection() {
    return (
        <section className="bg-white py-24 sm:py-32 border-t border-zinc-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-orange-600">لماذا Jootiya؟</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                        تجربة بيع وشراء لا مثيل لها
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                                    <feature.icon className="h-8 w-8 text-orange-600" aria-hidden="true" />
                                </div>
                                <dt className="text-xl font-semibold leading-7 text-zinc-900">
                                    {feature.title}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
