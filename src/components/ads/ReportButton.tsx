"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
    targetId: string;
    targetType: "ad" | "user";
    reporterId?: string;
}

export function ReportButton({ targetId, targetType, reporterId }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all h-9 px-3"
            >
                <Flag className="w-4 h-4" />
                <span className="text-xs font-bold">إبلاغ (Report)</span>
            </Button>

            <ReportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                targetId={targetId}
                targetType={targetType}
                reporterId={reporterId}
            />
        </>
    );
}
