import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'من نحن - Jootiya',
    description: 'تعرف على jootiya.com، المنصة العربية الرائدة في المغرب.',
};

export default function AboutUsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl" dir="rtl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">عن jootiya.com</h1>
                <div className="w-24 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                <div className="space-y-6 text-lg text-zinc-700 leading-relaxed text-right">
                    <p>
                        موقع <span className="font-bold text-orange-600">jootiya.com</span> هو منصة عربية رائدة تهدف إلى تقديم تجربة متميزة في بيع وشراء المنتجات والخدمات بكل سهولة وأمان.
                    </p>
                    <p>
                        نحن نؤمن بقوة المعلومة الصحيحة والتعامل الشفاف، ونسعى جاهدين لتقديم بيئة موثوقة تفيد المستخدم المغربي وتلبي تطلعاته في عالم التجارة الإلكترونية والإعلانات المبوبة.
                    </p>
                    <p>
                        فريقنا يعمل على مدار الساعة لضمان جودة المحتوى وتوافقه مع معايير البحث العالمية، مع التركيز التام على سهولة الاستخدام وتوفير الوقت لعملائنا.
                    </p>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-zinc-100 flex items-center justify-center">
                    {/* Using a placeholder-like div with rich aesthetics as requested if no image is available */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-zinc-900/20 z-0"></div>
                    <div className="z-10 text-center p-8">
                        <span className="text-6xl mb-4 block">🚀</span>
                        <h3 className="text-2xl font-bold text-zinc-800">طموحنا بلا حدود</h3>
                        <p className="text-zinc-600">نسعى لنكون الخيار الأول في المغرب</p>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-50 rounded-3xl p-8 md:p-12 border border-zinc-100">
                <div className="grid sm:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <div className="text-4xl font-bold text-orange-600">+10k</div>
                        <div className="text-zinc-500 font-medium">مستخدم نشط</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-4xl font-bold text-orange-600">+50k</div>
                        <div className="text-zinc-500 font-medium">إعلان منشور</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-4xl font-bold text-orange-600">24/7</div>
                        <div className="text-zinc-500 font-medium">دعم فني</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
