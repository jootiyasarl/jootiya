"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: "ad" | "user";
    reporterId?: string;
}

const REPORT_REASONS = [
    { id: "scam", label: "احتيال (Scam/Fraud)", icon: ShieldAlert, color: "text-red-500" },
    { id: "inappropriate", label: "محتوى غير لائق (Inappropriate)", icon: Flag, color: "text-orange-500" },
    { id: "fake_price", label: "سعر وهمي (Fake Price)", icon: AlertTriangle, color: "text-amber-500" },
    { id: "duplicate", label: "إعلان مكرر (Duplicate)", icon: Flag, color: "text-blue-500" },
    { id: "other", label: "سبب آخر (Other)", icon: Flag, color: "text-zinc-500" },
];

export function ReportModal({ isOpen, onClose, targetId, targetType, reporterId }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error("يرجى اختيار سبب الإبلاغ");
            return;
        }

        setIsSubmitting(true);
        try {
            const reasonLabel = REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;

            const { error } = await supabase
                .from("reports")
                .insert({
                    target_type: targetType,
                    ad_id: targetType === "ad" ? targetId : null,
                    reported_user_id: targetType === "user" ? targetId : null,
                    reporter_id: reporterId || null,
                    reason: reasonLabel,
                    details: { comment: details }
                });

            if (error) throw error;

            toast.success("تم إرسال بلاغك بنجاح. سنقوم بمراجعته قريباً.");
            onClose();
        } catch (error: any) {
            toast.error("عذراً، حدث خطأ أثناء إرسال البلاغ.");
            console.error("Report Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                            <Flag className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-zinc-900 leading-tight">الإبلاغ عن الإعلان</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Report this Listing</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-zinc-700 mb-2">ما هو سبب الإبلاغ؟</p>
                        <div className="grid gap-2">
                            {REPORT_REASONS.map((reason) => {
                                const Icon = reason.icon;
                                const isSelected = selectedReason === reason.id;
                                return (
                                    <button
                                        key={reason.id}
                                        onClick={() => setSelectedReason(reason.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-right group",
                                            isSelected
                                                ? "border-red-600 bg-red-50/50"
                                                : "border-zinc-100 hover:border-zinc-200 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("w-5 h-5", isSelected ? "text-red-600" : reason.color)} />
                                            <span className={cn("text-sm font-bold", isSelected ? "text-red-700" : "text-zinc-600")}>{reason.label}</span>
                                        </div>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-red-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold text-zinc-700">تفاصيل إضافية (اختياري)</p>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full p-4 rounded-2xl border-2 border-zinc-100 focus:border-red-600 focus:ring-0 transition-all text-sm min-h-[100px] bg-zinc-50/30 resize-none text-right"
                            placeholder="أخبرنا بالمزيد عن المشكلة..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-50/50 border-t border-zinc-100">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] py-0"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "إرسال البلاغ"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
