"use client";

import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionFooterProps {
    phone: string;
    adTitle: string;
}

export function QuickActionFooter({ phone, adTitle }: QuickActionFooterProps) {
    const whatsappUrl = `https://wa.me/${phone?.replace(/\s+/g, '')}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé par votre annonce "${adTitle}" sur Jootiya.`
    )}`;

    return (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex gap-3 max-w-md mx-auto">
                <a
                    href={`tel:${phone}`}
                    className="flex-1 min-h-[44px] h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-200"
                >
                    <Phone className="w-5 h-5" />
                    اتصال
                </a>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] h-12 border border-green-600 text-green-600 hover:bg-green-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <MessageCircle className="w-5 h-5" />
                    واتساب
                </a>
            </div>
        </div>
    );
}
