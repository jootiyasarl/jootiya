import React from 'react';

export const metadata = {
    title: 'سياسة الخصوصية - Jootiya',
    description: 'سياسة الخصوصية لموقع jootiya.com',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
            <h1 className="text-3xl font-bold mb-8 text-zinc-900">سياسة الخصوصية لموقع jootiya.com</h1>

            <div className="prose prose-zinc max-w-none space-y-6 text-zinc-700 leading-relaxed text-lg">
                <p>
                    في jootiya.com، خصوصية زوارنا لها أهمية بالغة بالنسبة لنا. توضح هذه الوثيقة أنواع المعلومات الشخصية التي نجمعها وكيفية استخدامها.
                </p>

                <section>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-3">ملفات السجل (Log Files):</h2>
                    <p>
                        مثل العديد من مواقع الويب الأخرى، يستخدم jootiya.com ملفات السجل. المعلومات داخل ملفات السجل تشمل عناوين بروتوكول الإنترنت (IP)، نوع المتصفح، مزود خدمة الإنترنت (ISP)، طابع التاريخ/الوقت، صفحات الإحالة/الخروج، وعدد النقرات لتحليل الاتجاهات وإدارة الموقع.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-3">كوكيز جوجل وسهم DART:</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>تستخدم جوجل، كطرف ثالث، الكوكيز لعرض الإعلانات على jootiya.com.</li>
                        <li>استخدام جوجل لسهم DART يتيح لها عرض الإعلانات للمستخدمين بناءً على زيارتهم لموقعنا ومواقع أخرى على الإنترنت.</li>
                        <li>يمكن للمستخدمين اختيار عدم استخدام ملفات تعريف الارتباط DART عن طريق زيارة سياسة الخصوصية الخاصة بإعلانات جوجل وشبكة المحتوى على العنوان التالي: <a href="https://policies.google.com/technologies/ads" className="text-orange-600 hover:underline">https://policies.google.com/technologies/ads</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-3">شركاؤنا الإعلانيون:</h2>
                    <p>
                        قد يستخدم بعض شركائنا الإعلانيين الكوكيز ومنارات الويب في موقعنا. شريكنا الإعلاني الأساسي هو Google AdSense. نحن لا نملك أي سلطة أو سيطرة على هذه الكوكيز التي يستخدمها معلنون من طرف ثالث.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-3">اللائحة العامة لحماية البيانات (GDPR):</h2>
                    <p>
                        نحن نضمن حقك في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها وفقاً للمعايير الدولية لحماية البيانات.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-3">اتصل بنا:</h2>
                    <p>
                        لأي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر: <a href="mailto:contact@jootiya.com" className="text-orange-600 hover:underline">contact@jootiya.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
