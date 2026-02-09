"use client";

import { useState } from "react";
import {
    LifeBuoy,
    Send,
    MessageSquare,
    ShieldCheck,
    Search,
    ChevronDown,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "technical", label: "مشكل تقني (Technical)", icon: MessageSquare },
    { id: "billing", label: "الدفع والإعلانات (Payments)", icon: ShieldCheck },
    { id: "account", label: "حسابي (Account)", icon: LifeBuoy },
    { id: "general", label: "استفسار عام (General)", icon: Search },
];

export default function HelpPage() {
    const [selectedCategory, setSelectedCategory] = useState("general");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !subject || !message) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("support_tickets")
                .insert({
                    category: selectedCategory,
                    email,
                    subject,
                    message,
                });

            if (error) throw error;

            toast.success("تم إرسال رسالتك بنجاح!");
            setIsSubmitted(true);
        } catch (error: any) {
            toast.error("حدث خطأ أثناء إرسال الرسالة.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce">
                        <Send className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-zinc-900">تم الإرسال بنجاح!</h1>
                        <p className="text-zinc-500 font-medium">سنتواصل معك عبر البريد الإلكتروني في أقرب وقت ممكن.</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                    >
                        العودة للرئيسية
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-10 pb-20 px-4">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-black uppercase tracking-widest">
                        <LifeBuoy className="w-4 h-4" />
                        مركز المساعدة
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">كيف يمكننا مساعدتك؟</h1>
                    <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium">نحن هنا للإجابة على جميع استفساراتك وحل المشاكل التي تواجهك.</p>
                </div>

                <div className="grid md:grid-cols-12 gap-10">

                    {/* Sidebar / Categories */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100">
                            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">التصنيفات</h3>
                            <div className="space-y-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                            selectedCategory === cat.id
                                                ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200"
                                                : "hover:bg-zinc-50 text-zinc-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <cat.icon className={cn("w-5 h-5", selectedCategory === cat.id ? "text-orange-400" : "text-zinc-400 group-hover:text-zinc-600")} />
                                            <span className="font-bold text-sm">{cat.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Contact Info */}
                        <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                <h4 className="text-xl font-black leading-tight">تواصل معنا مباشرة عبر واتساب</h4>
                                <Button
                                    onClick={() => window.open('https://wa.me/212600000000', '_blank')}
                                    className="bg-white text-orange-600 hover:bg-zinc-50 font-black h-12 rounded-xl"
                                >
                                    إرسال رسالة
                                </Button>
                            </div>
                            <LifeBuoy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* Form */}
                    <div className="md:col-span-8">
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-zinc-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-zinc-900 mr-2">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@mail.com"
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 transition-all font-medium text-zinc-900 text-right"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-zinc-900 mr-2">الموضوع</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="أدخل عنوان الرسالة"
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 transition-all font-medium text-zinc-900 text-right"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-zinc-900 mr-2">الرسالة</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="كيف يمكننا مساعدتك؟ اشرح لنا المشكلة بالتفصيل..."
                                        className="w-full p-6 rounded-[2rem] border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 transition-all font-medium text-zinc-900 min-h-[200px] bg-zinc-50/30 resize-none text-right"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg shadow-2xl shadow-zinc-200 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            إرسال الطلب
                                            <Send className="w-5 h-5 ml-2 mr-0" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
