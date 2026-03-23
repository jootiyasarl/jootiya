"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ViralShareButtonProps {
  adId: string;
  adTitle: string;
  adPrice: string;
  sellerId: string;
  showAsMainAction?: boolean;
}

export function ViralShareButton({ adId, adTitle, adPrice, sellerId, showAsMainAction = false }: ViralShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate unique referral link
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://jootiya.com";
  const referralLink = `${baseUrl}/ads/${adId}?ref=${sellerId}`;

  const whatsappMessage = `Regardez cette offre sur Jootiya ! 🤩\n\n*${adTitle}*\n💰 Prix : *${adPrice}*\n\nVoir plus de détails ici :\n${referralLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: adTitle,
          text: `Regardez cette offre sur Jootiya ! ${adTitle} à ${adPrice}`,
          url: referralLink,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      handleCopy();
    }
  };

  if (showAsMainAction) {
    return (
      <div className="w-full">
        <Button
          onClick={handleNativeShare}
          className="w-full h-14 text-lg font-black rounded-2xl bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all active:scale-[0.98] gap-3 shadow-sm group"
        >
          <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          {copied ? "Lien copié !" : "Partager l'annonce"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">Partagez et obtenez un boost gratuit</p>
      <div className="flex gap-2">
        <Button
          onClick={() => window.open(whatsappUrl, "_blank")}
          className="flex-[2] h-12 bg-[#25D366] hover:bg-[#22c35e] text-white font-black rounded-xl gap-2 shadow-lg shadow-green-100 dark:shadow-none"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          onClick={handleNativeShare}
          className="flex-1 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 gap-2 font-bold"
        >
          <Share2 className="w-4 h-4" />
          {isSharing ? "..." : "Plus"}
        </Button>
      </div>
    </div>
  );
}
