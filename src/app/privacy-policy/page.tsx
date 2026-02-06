import React from 'react';

export const metadata = {
    title: 'سياسة الخصوصية - Jootiya',
    description: 'سياسة الخصوصية لموقع jootiya.com',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white min-h-screen" dir="rtl">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 py-24 px-4 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">سياسة الخصوصية</h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium">نحن نحمي بياناتك كما نحمي موقعنا</p>
                    <div className="w-24 h-2 bg-orange-500 mx-auto mt-10 rounded-full shadow-lg shadow-orange-500/20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <div className="prose prose-zinc max-w-none space-y-16 text-zinc-700 leading-relaxed text-lg">
                    <div className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 shadow-sm text-center">
                        <p className="text-xl md:text-2xl font-semibold text-zinc-800">
                            في jootiya.com، خصوصية زوارنا لها أهمية بالغة بالنسبة لنا. توضح هذه الوثيقة أنواع المعلومات الشخصية التي نجمعها وكيفية استخدامها.
                        </p>
                    </div>

                    <section className="group transition-all duration-300">
                        <h2 className="text-3xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                            <span className="w-2.5 h-10 bg-orange-500 rounded-full inline-block group-hover:bg-orange-600 transition-colors"></span>
                            ملفات السجل (Log Files)
                        </h2>
                        <p className="leading-loose pl-6 text-zinc-600">
                            مثل العديد من مواقع الويب الأخرى، يستخدم jootiya.com ملفات السجل. المعلومات داخل ملفات السجل تشمل عناوين بروتوكول الإنترنت (IP)، نوع المتصفح، مزود خدمة الإنترنت (ISP)، طابع التاريخ/الوقت، صفحات الإحالة/الخروج، وعدد النقرات لتحليل الاتجاهات وإدارة الموقع.
                        </p>
                    </section>

                    <section className="group transition-all duration-300">
                        <h2 className="text-3xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                            <span className="w-2.5 h-10 bg-orange-500 rounded-full inline-block group-hover:bg-orange-600 transition-colors"></span>
                            كوكيز جوجل وسهم DART
                        </h2>
                        <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 space-y-6">
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="text-orange-500 font-bold mt-1">•</span>
                                    <span>تستخدم جوجل، كطرف ثالث، الكوكيز لعرض الإعلانات على jootiya.com.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-orange-500 font-bold mt-1">•</span>
                                    <span>استخدام جوجل لسهم DART يتيح لها عرض الإعلانات للمستخدمين بناءً على زيارتهم لموقعنا ومواقع أخرى على الإنترنت.</span>
                                </li>
                            </ul>
                            <div className="bg-white p-6 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                <span className="text-zinc-700 font-medium">يمكن للمستخدمين اختيار عدم استخدام ملفات تعريف الارتباط DART.</span>
                                <a
                                    href="https://policies.google.com/technologies/ads"
                                    className="w-full md:w-auto text-center bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                                >
                                    زيارة سياسة جوجل
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="group transition-all duration-300">
                        <h2 className="text-3xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                            <span className="w-2.5 h-10 bg-orange-500 rounded-full inline-block group-hover:bg-orange-600 transition-colors"></span>
                            اللائحة العامة لحماية البيانات (GDPR)
                        </h2>
                        <div className="flex gap-6 items-start bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100">
                            <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shrink-0">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">حقوقك مكفولة</h3>
                                <p className="text-zinc-600 text-lg">
                                    نحن نضمن حقك في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها وفقاً للمعايير الدولية لحماية البيانات. خصوصيتك هي أولويتنا القصوى في jootiya.com.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-6">هل لديك أي استفسار؟</h3>
                            <p className="text-zinc-400 mb-10 text-lg md:text-xl max-w-2xl mx-auto">
                                فريقنا القانوني جاهز للرد على أي تساؤلات تتعلق ببياناتك وخصوصيتك. لا تتردد في مراسلتنا.
                            </p>
                            <a
                                href="mailto:contact@jootiya.com"
                                className="inline-flex items-center gap-3 bg-white text-zinc-900 px-12 py-5 rounded-2xl font-black hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-xl"
                            >
                                تواصل معنا الآن
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
