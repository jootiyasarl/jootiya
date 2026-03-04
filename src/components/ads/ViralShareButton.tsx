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
}

export function ViralShareButton({ adId, adTitle, adPrice, sellerId }: ViralShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Generate unique referral link
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://jootiya.com";
  const referralLink = `${baseUrl}/ads/${adId}?ref=${sellerId}`;

  const whatsappMessage = `Regardez cette offre sur Jootiya ! 🤩\n\n*${adTitle}*\n💰 Prix : *${adPrice}*\n\nVoir plus de détails ici :\n${referralLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien de parrainage copié avec succès !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: adTitle,
          text: `Regardez cette offre sur Jootiya ! ${adTitle} à ${adPrice}`,
          url: referralLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">Partagez et obtenez un boost gratuit</p>
      <div className="flex gap-2">
        <Button
          onClick={() => window.open(whatsappUrl, "_blank")}
          className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c35e] text-white font-black rounded-xl gap-2 shadow-lg shadow-green-100 dark:shadow-none"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          onClick={handleNativeShare}
          className="h-12 w-12 rounded-xl border-zinc-200 dark:border-zinc-800"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="h-12 w-12 rounded-xl border-zinc-200 dark:border-zinc-800"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
