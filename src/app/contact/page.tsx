import React from 'react';
import { Mail, Clock, MessageSquare } from 'lucide-react';

export const metadata = {
    title: 'تواصل معنا - Jootiya',
    description: 'اتصل بنا عبر البريد الإلكتروني أو من خلال موقعنا.',
};

export default function ContactUsPage() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-5xl" dir="rtl">
            <div className="grid lg:grid-cols-2 gap-16">
                {/* Contact Information */}
                <div className="space-y-8 text-right">
                    <div>
                        <h1 className="text-4xl font-bold text-zinc-900 mb-6">تواصل معنا</h1>
                        <p className="text-xl text-zinc-600 leading-relaxed mb-8">
                            نحن في <span className="text-orange-600 font-bold">jootiya.com</span> نسعد دائماً بسماع آرائكم واستفساراتكم. سواء كان لديك سؤال عام، شكوى، أو طلب إعلان، نحن هنا للمساعدة.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-5 group">
                            <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-800 mb-1">البريد الإلكتروني الرسمي</h3>
                                <a href="mailto:contact@jootiya.com" className="text-zinc-600 hover:text-orange-600 transition-colors text-lg">
                                    contact@jootiya.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-800 mb-1">وقت الاستجابة</h3>
                                <p className="text-zinc-600 text-lg">نعدكم بالرد على كافة الاستفسارات في غضون 24-48 ساعة.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                                <MessageSquare size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-800 mb-1">دعم متواصل</h3>
                                <p className="text-zinc-600 text-lg">فريقنا جاهز للإجابة على جميع تساؤلاتكم وأخذ مقترحاتكم بعين الاعتبار.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Card / Design Element */}
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-[2rem] rotate-3 opacity-10"></div>
                    <div className="relative bg-white border border-zinc-100 p-8 md:p-12 rounded-[2rem] shadow-xl">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-4">هل لديك أي اقتراح؟</h3>
                            <p className="text-zinc-600 mb-8">نحن نؤمن بأن ملاحظاتكم هي سر نجاحنا. لا تتردد في مراسلتنا بالضغط على الزر أدناه.</p>
                            <a
                                href="mailto:contact@jootiya.com"
                                className="inline-flex items-center justify-center w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/20"
                            >
                                أرسل لنا رسالة الآن
                            </a>
                            <div className="text-center mt-6">
                                <p className="text-xs text-zinc-400">نحن نحترم خصوصيتك ولا نقوم بمشاركة بياناتك مع أي طرف ثالث.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
