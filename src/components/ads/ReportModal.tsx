"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { submitReportAction } from "@/app/ads/actions";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: "ad" | "user";
    reporterId?: string;
}

const REPORT_REASONS = [
    { id: "scam", label: "Arnaque / Fraude", icon: ShieldAlert, color: "text-red-500" },
    { id: "inappropriate", label: "Contenu inapproprié", icon: Flag, color: "text-orange-500" },
    { id: "fake_price", label: "Prix fictif", icon: AlertTriangle, color: "text-amber-500" },
    { id: "duplicate", label: "Annonce en double", icon: Flag, color: "text-blue-500" },
    { id: "other", label: "Autre raison", icon: Flag, color: "text-zinc-500" },
];

export function ReportModal({ isOpen, onClose, targetId, targetType, reporterId }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error("Veuillez sélectionner un motif de signalement");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitReportAction({
                targetId,
                targetType,
                reason: REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason,
                details
            });

            if (result.error) throw new Error(result.error);

            toast.success("Votre signalement a été envoyé avec succès.");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Désolé, une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl z-[9999]">
                <DialogHeader className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                            <Flag className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-lg font-black text-zinc-900 uppercase">Signaler l'annonce</DialogTitle>
                            <DialogDescription className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Motif du signalement
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid gap-3">
                        {REPORT_REASONS.map((reason) => {
                            const Icon = reason.icon;
                            const isSelected = selectedReason === reason.id;
                            return (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(reason.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                        isSelected
                                            ? "border-red-600 bg-red-50/30 scale-[1.02]"
                                            : "border-zinc-100 hover:border-zinc-200 bg-zinc-50/30"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            isSelected ? "bg-red-600 text-white" : "bg-white text-zinc-400"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={cn("text-sm font-bold", isSelected ? "text-red-700" : "text-zinc-600")}>
                                            {reason.label}
                                        </span>
                                    </div>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-sm font-black uppercase tracking-widest text-zinc-400 px-1">Détails</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full p-5 rounded-2xl border-2 border-zinc-100 focus:border-red-600 focus:ring-0 transition-all bg-zinc-50/30 min-h-[100px] resize-none"
                            placeholder="Décrivez le problème..."
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-14 rounded-2xl shadow-xl"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Envoyer le signalement"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
