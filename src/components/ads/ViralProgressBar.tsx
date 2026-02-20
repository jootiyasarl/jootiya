"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2 } from "lucide-react";

export interface ViralProgressBarProps {
  adId: string;
  initialCount: number;
  isFeatured: boolean;
  sellerId: string;
  currentUserId?: string;
}

export function ViralProgressBar({ adId, initialCount, isFeatured, sellerId, currentUserId }: ViralProgressBarProps) {
  const [count, setCount] = useState(initialCount);
  const [featured, setFeatured] = useState(isFeatured);
  const isOwner = currentUserId === sellerId;

  useEffect(() => {
    if (!isOwner) return;

    // Listen for real-time updates on the ads table for this specific ad
    const channel = supabase
      .channel(`ad_viral_${adId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ads',
          filter: `id=eq.${adId}`
        },
        (payload) => {
          if (payload.new.referral_count !== undefined) {
            setCount(payload.new.referral_count);
          }
          if (payload.new.is_featured !== undefined) {
            setFeatured(payload.new.is_featured);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adId, isOwner]);

  if (!isOwner || featured) {
    if (featured && isOwner) {
      return (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">إعلانك مُميز الآن! ✨</p>
              <p className="text-[10px] opacity-90 text-right">بفضل مشاركاتك، إعلانك يظهر في المقدمة مجاناً.</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const progress = Math.min((count / 5) * 100, 100);
  const remaining = Math.max(5 - count, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-2 border-orange-100 dark:border-orange-900/30 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">هدايا جولتيا المجانية</span>
        </div>
        <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">Viral Engine</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="text-[11px] text-zinc-500 font-medium">باقي ليك <span className="text-orange-600 font-bold">{remaining}</span> دي الخلال (Clicks) باش يولي إعلانك مُميز مجاناً!</p>
          <span className="text-[10px] font-bold text-zinc-400">{count}/5</span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-100" />
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed">شارط الرابط ديالك مع صحابك فواتساب، وكل واحد دخل يشوف الإعلان كيقربك للتمييز المجاني.</p>
    </div>
  );
}
