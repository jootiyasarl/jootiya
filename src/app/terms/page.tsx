import React from 'react';

export const metadata = {
    title: 'اتفاقية الاستخدام - Jootiya',
    description: 'شروط الاستخدام لموقع jootiya.com',
};

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
            <h1 className="text-3xl font-bold mb-8 text-zinc-900">شروط الاستخدام لموقع jootiya.com</h1>

            <div className="prose prose-zinc max-w-none space-y-8 text-zinc-700 leading-relaxed text-lg">
                <p className="text-xl font-medium text-zinc-800">
                    باستخدامك لموقعنا، فأنت توافق على الالتزام بالشروط التالية:
                </p>

                <section>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                        <h2 className="text-2xl font-semibold text-zinc-800">المحتوى:</h2>
                    </div>
                    <p>
                        جميع المواد المنشورة في jootiya.com هي حقوق ملكية فكرية للموقع، ولا يسمح بنسخها أو إعادة نشرها دون إذن خطي.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                        <h2 className="text-2xl font-semibold text-zinc-800">إخلاء المسؤولية:</h2>
                    </div>
                    <p>
                        المعلومات المقدمة هي لأغراض عامة، ولا نتحمل مسؤولية أي سوء فهم أو استخدام خاطئ للمعلومات.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                        <h2 className="text-2xl font-semibold text-zinc-800">التغييرات:</h2>
                    </div>
                    <p>
                        نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق.
                    </p>
                </section>
            </div>
        </div>
    );
}
