import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'من نحن - Jootiya',
    description: 'تعرف على jootiya.com، المنصة العربية الرائدة في المغرب.',
};

export default function AboutUsPage() {
    return (
        <div className="bg-white min-h-screen" dir="rtl">
            {/* Dynamic Header */}
            <div className="bg-zinc-900 py-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-600/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                        عن <span className="text-orange-500">JOOTIYA</span>
                    </h1>
                    <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                        المنصة العربية الرائدة التي تعيد تعريف تجربة البيع والشراء في المغرب.
                    </p>
                    <div className="w-32 h-2 bg-orange-500 mx-auto mt-12 rounded-full"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24 max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="space-y-8 text-lg text-zinc-600 leading-loose text-right">
                        <h2 className="text-4xl font-black text-zinc-900 mb-4 leading-tight">
                            نحن هنا من أجلك <br />
                            <span className="text-orange-500">في كل خطوة</span>
                        </h2>
                        <p className="text-xl">
                            موقع <span className="font-black text-zinc-900">jootiya.com</span> ليس مجرد سوق إلكتروني، بل هو مجتمع متكامل يهدف إلى تسهيل حياة المستخدم المغربي.
                        </p>
                        <p>
                            نحن نؤمن بقوة المعلومة الصحيحة والتعامل الشفاف، ونسعى جاهدين لتقديم بيئة موثوقة وآمنة تماماً تتيح لك الوصول إلى ما تريد بأقل مجهود وبأفضل سعر.
                        </p>
                        <p className="p-6 bg-zinc-50 border-r-8 border-orange-500 rounded-l-3xl italic text-zinc-800">
                            "فريقنا يعمل على مدار الساعة لضمان جودة المحتوى وتوافقه مع معايير البحث العالمية، مع التركيز التام على سهولة الاستخدام."
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900 flex flex-col items-center justify-center p-12 text-center text-white">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/5">
                                <span className="text-6xl">🚀</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4">طموحنا بلا حدود</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                نسعى لنكون الخيار الأول والوجهة الموثوقة لكل مغربي يبحث عن التميز والسهولة.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-zinc-900 rounded-[4rem] -mx-4 md:-mx-12 py-20 translate-y-20"></div>
                    <div className="relative grid sm:grid-cols-3 gap-12 text-center bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl border border-zinc-100">
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-orange-600 tracking-tighter">+10k</div>
                            <div className="text-zinc-500 font-bold text-xl">مستخدم نشط</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-zinc-900 tracking-tighter">+50k</div>
                            <div className="text-zinc-500 font-bold text-xl">إعلان منشور</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-6xl font-black text-blue-600 tracking-tighter">24/7</div>
                            <div className="text-zinc-500 font-bold text-xl">دعم فني متميز</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-64"></div> {/* Spacer for stats overlap */}
        </div>
    );
}
