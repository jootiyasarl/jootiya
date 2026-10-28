"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/app/messages/actions";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContactActionsProps {
  adId: string;
  sellerId: string;
  sellerPhone?: string;
  currentUser: any;
}

export function ContactActions({
  adId,
  sellerId,
  sellerPhone,
  currentUser,
}: ContactActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ── WhatsApp CTA ─────────────────────────────────
  const handleWhatsAppClick = () => {
    if (!sellerPhone) {
      toast.error("Numero de telephone non disponible.");
      return;
    }
    const cleanPhone = sellerPhone.replace(/\D/g, "");
    const formatPhone =
      cleanPhone.startsWith("0") && cleanPhone.length === 10
        ? "212" + cleanPhone.substring(1)
        : cleanPhone;

    const waMessage =
      "Bonjour, j'ai vu votre annonce sur Jootiya. Est-elle toujours disponible ?";
    window.open(
      `https://wa.me/${formatPhone}?text=${encodeURIComponent(waMessage)}`,
      "_blank"
    );
  };

  // ── In-platform message ───────────────────────────
  const handleQuickMessage = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      const result = await sendMessageAction({
        adId,
        sellerId,
        content: message.trim(),
      });

      if (result.error) {
        if (result.error.includes("connecter")) {
          router.push(`/login?next=/ads/${adId}`);
        } else {
          toast.error(result.error);
        }
        return;
      }

      setIsOpen(false);
      setMessage("");
      toast.success("Message envoye !");
      router.push(`/dashboard/messages?id=${result.conversationId}`);
    } catch {
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* WhatsApp — Emerald */}
      <button
        onClick={handleWhatsAppClick}
        className="w-full h-13 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-sm transition-all"
      >
        {/* WhatsApp logo SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Contacter via WhatsApp
      </button>

      {/* Phone — Dark Slate */}
      {sellerPhone && (
        <a
          href={`tel:${sellerPhone}`}
          className="w-full h-13 flex items-center justify-center gap-2.5 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-sm transition-all"
        >
          <Phone className="h-4.5 w-4.5 shrink-0" />
          Appeler
        </a>
      )}

      {/* In-app message dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="w-full h-12 flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-800 font-bold text-sm rounded-2xl transition-all">
          <MessageCircle className="h-4.5 w-4.5" />
          Envoyer un message
        </DialogTrigger>

        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-gray-100 shadow-2xl p-0 overflow-hidden gap-0 z-[99999]">
          <DialogHeader className="p-6 pb-3 text-left">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4.5 w-4.5 text-gray-600" />
              </span>
              Message au vendeur
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1">
              Votre message sera envoye directement au vendeur.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-2 space-y-3">
            <Textarea
              placeholder="Bonjour, je suis interesse par votre annonce..."
              className="min-h-[110px] resize-none rounded-2xl bg-gray-50 border-gray-200 focus:border-gray-400 text-[15px] text-gray-800 placeholder:text-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Quick replies */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                "Est-ce toujours disponible ?",
                "Quel est votre dernier prix ?",
                "Peut-on se voir ?",
              ].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setMessage(quick)}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-semibold transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 sm:justify-between flex-row items-center gap-2">
            <span className="text-[10px] text-gray-400 pl-1 hidden sm:block">
              Reponse sous 24h en general
            </span>
            <Button
              onClick={handleQuickMessage}
              disabled={!message.trim() || isSending}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 font-bold px-6 ml-auto"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
