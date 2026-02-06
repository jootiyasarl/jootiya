import React from 'react';
import { Mail, Clock, MessageSquare } from 'lucide-react';

export const metadata = {
    title: 'تواصل معنا - Jootiya',
    description: 'اتصل بنا عبر البريد الإلكتروني أو من خلال موقعنا.',
};

export default function ContactUsPage() {
    return (
        <div className="bg-white min-h-screen" dir="rtl">
            {/* Minimal Premium Header */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.1" />
                        <path d="M0,50 L100,50" fill="none" stroke="white" strokeWidth="0.1" />
                    </svg>
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">تواصل معنا</h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        نحن في <span className="text-orange-500 font-bold">jootiya.com</span> نسعد دائماً بسماع آرائكم واستفساراتكم. فريقنا جاهز للمساعدة.
                    </p>
                    <div className="w-24 h-2 bg-orange-600 mx-auto mt-10 rounded-full shadow-lg shadow-orange-600/20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-20 items-stretch">
                    {/* Contact Information */}
                    <div className="space-y-12 text-right flex flex-col justify-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-zinc-900 border-r-8 border-orange-500 pr-6">مرحباً بك في عالمنا</h2>
                            <p className="text-xl text-zinc-600 leading-relaxed font-medium">
                                سواء كان لديك سؤال عام، شكوى، أو طلب إعلان، نحن هنا لنضمن لك تجربة مستخدم لا تنسى.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">البريد الإلكتروني</h3>
                                    <a href="mailto:contact@jootiya.com" className="text-zinc-600 hover:text-orange-600 transition-colors text-lg font-bold">
                                        contact@jootiya.com
                                    </a>
                                </div>
                            </div>

                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Clock size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">وقت الاستجابة</h3>
                                    <p className="text-zinc-600 text-lg font-medium">نعدكم بالرد في غضون 24-48 ساعة.</p>
                                </div>
                            </div>

                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-orange-50/50 border border-orange-100 hover:bg-white hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300">
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">دعم متواصل</h3>
                                    <p className="text-zinc-600 text-lg font-medium">دعم فني جاهز للإجابة على جميع تساؤلاتكم.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card / Design Element */}
                    <div className="relative h-full flex items-center">
                        <div className="absolute -inset-6 bg-gradient-to-tr from-orange-500 to-zinc-900 rounded-[4rem] blur-3xl opacity-10"></div>
                        <div className="relative w-full bg-white border border-zinc-100 p-12 md:p-16 rounded-[4rem] shadow-2xl flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-10 ring-8 ring-orange-50/50 animate-pulse">
                                <Mail size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 mb-6">هل لديك أي اقتراح؟</h3>
                            <p className="text-zinc-500 text-lg mb-10 leading-relaxed font-medium">
                                نحن نؤمن بأن ملاحظاتكم هي سر نجاحنا وتطورنا المستمر. لا تتردد في مراسلتنا بالضغط على الزر أدناه.
                            </p>
                            <a
                                href="mailto:contact@jootiya.com"
                                className="group flex items-center justify-center gap-4 w-full bg-zinc-900 text-white font-black py-6 rounded-3xl hover:bg-orange-600 transition-all shadow-2xl shadow-zinc-900/20 active:scale-95"
                            >
                                أرسل لنا رسالة الآن
                                <svg className="group-hover:translate-x-[-8px] transition-transform" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            </a>
                            <div className="mt-10 pt-8 border-t border-zinc-100 w-full">
                                <p className="text-sm text-zinc-400 font-medium italic">نحن نحترم خصوصيتك ولا نقوم بمشاركة بياناتك مع أي طرف ثالث.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24"></div>
        </div>
    );
}
