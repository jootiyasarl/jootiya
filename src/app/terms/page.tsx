import React from 'react';

export const metadata = {
    title: 'اتفاقية الاستخدام - Jootiya',
    description: 'شروط الاستخدام لموقع jootiya.com',
};

export default function TermsOfServicePage() {
    return (
        <div className="bg-white min-h-screen" dir="rtl">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-zinc-900 py-24 px-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="90" cy="10" r="30" fill="white" />
                        <circle cx="10" cy="90" r="20" fill="white" />
                    </svg>
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">اتفاقية الاستخدام</h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium">نظم تعاملك معنا بكل شفافية ووضوح</p>
                    <div className="w-24 h-2 bg-blue-500 mx-auto mt-10 rounded-full shadow-lg shadow-blue-500/20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <div className="prose prose-zinc max-w-none space-y-12 text-zinc-700 leading-relaxed text-lg">
                    <div className="p-10 bg-blue-50/30 rounded-[2.5rem] border border-blue-100/50 shadow-sm text-center">
                        <p className="text-xl md:text-2xl font-semibold text-zinc-800">
                            باستخدامك لموقعنا <span className="text-blue-600 font-black">jootiya.com</span>، فأنت توافق على الالتزام بالشروط والبنود التالية التي تضمن تجربة آمنة للجميع.
                        </p>
                    </div>

                    <article className="space-y-16">
                        <section className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900">المحتوى</h2>
                            </div>
                            <p className="text-zinc-600 text-lg leading-loose pl-2 border-r-4 border-orange-500 pr-6 mr-2">
                                جميع المواد المنشورة في <span className="font-bold text-zinc-800">jootiya.com</span> هي حقوق ملكية فكرية للموقع. نحن نبذل جهداً كبيراً لتوفير محتوى حصري ومفيد، لذا لا يسمح بنسخها أو إعادة نشرها دون إذن خطي مسبق من الإدارة.
                            </p>
                        </section>

                        <section className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900">إخلاء المسؤولية</h2>
                            </div>
                            <p className="text-zinc-600 text-lg leading-loose pl-2 border-r-4 border-blue-500 pr-6 mr-2">
                                المعلومات المقدمة في هذا الموقع هي لأغراض إعلامية وتجارية عامة. نحن نسعى للدقة ولكن لا نتحمل مسؤولية أي سوء فهم أو استخدام خاطئ للمعلومات من قبل المستخدمين.
                            </p>
                        </section>

                        <section className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900">التغييرات</h2>
                            </div>
                            <p className="text-zinc-600 text-lg leading-loose pl-2 border-r-4 border-zinc-900 pr-6 mr-2">
                                الإنترنت يتطور بسرعة، وكذلك نحن. نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق لضمان مواكبة التطورات وحماية حقوق جميع الأطراف.
                            </p>
                        </section>
                    </article>

                    <div className="mt-20 p-8 md:p-12 bg-zinc-900 rounded-[3rem] text-center text-white shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-bold mb-4">هل تحتاج إلى مزيد من المعلومات؟</h3>
                        <p className="text-zinc-400 mb-8">إذا كان لديك أي سؤال حول اتفاقية الاستخدام، لا تتردد في مراسلتنا.</p>
                        <a href="mailto:contact@jootiya.com" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-500/20">
                            راسلنا الآن
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
