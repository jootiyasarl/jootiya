"use client";

import { useState, useEffect } from "react";
import { Bell, X, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkPushPermission, subscribeUserToPush } from "@/lib/pushNotifications";
import { toast } from "sonner";

const COOLDOWN_DAYS = 2;
const STORAGE_KEY = "jootiya_push_cooldown";

export function PushPermissionPrompt() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Higher-order logic: Only show the prompt if triggered by an event
        // and if not in cooldown period
        const handleTrigger = async () => {
            const currentStatus = await checkPushPermission();
            if (currentStatus !== ('default' as any)) return;

            const lastDismissed = localStorage.getItem(STORAGE_KEY);
            if (lastDismissed) {
                const diff = Date.now() - parseInt(lastDismissed);
                const days = diff / (1000 * 60 * 60 * 24);
                if (days < COOLDOWN_DAYS) return;
            }

            setIsVisible(true);
        };

        window.addEventListener('trigger-push-prompt', handleTrigger);
        return () => window.removeEventListener('trigger-push-prompt', handleTrigger);
    }, []);

    const handleAllow = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await subscribeUserToPush();
                toast.success("تم تفعيل التنبيهات بنجاح!");
            }
            setIsVisible(false);
        } catch (error) {
            console.error("Push: Error requesting permission", error);
            toast.error("فشل تفعيل التنبيهات");
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center pointer-events-none animate-in fade-in duration-300">
            <div className="w-full max-w-[440px] pointer-events-auto overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 md:p-8">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400" />

                <button
                    onClick={handleDismiss}
                    className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center dark:bg-orange-900/30 rotate-3">
                            <Bell className="h-10 w-10 text-orange-600 animate-bounce" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                            <Zap className="h-4 w-4 fill-current" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                            ما تزگل حتى همزة! 🚀
                        </h3>
                        <p className="text-sm font-medium text-zinc-500 leading-relaxed dark:text-zinc-400 px-4">
                            فعل التنبيهات باش يوصلك ميساج دبا يلا شي حد هضر معاك، وماتضيع عليك حتى فرصة بيع أو شراء.
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-3 mt-2">
                        <Button
                            onClick={handleAllow}
                            className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg transition-all active:scale-95 shadow-xl shadow-orange-200 dark:shadow-none"
                        >
                            فعل التنبيهات
                        </Button>
                        <button
                            onClick={handleDismiss}
                            className="text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors py-2"
                        >
                            ليس الآن
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-black opacity-60">
                        <ShieldCheck className="h-3 w-3" />
                        نحترم خصوصيتك بالكامل
                    </div>
                </div>
            </div>
        </div>
    );
}
