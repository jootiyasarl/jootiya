"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, X, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ChatAudioRecorderProps {
    onSend: (fileUrl: string) => void;
    onCancel: () => void;
}

export function ChatAudioRecorder({ onSend, onCancel }: ChatAudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [cancelDistance, setCancelDistance] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startXRef = useRef<number | null>(null);

    const startRecording = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices || !window.MediaRecorder) {
            toast.error("Votre navigateur ne supporte pas l'enregistrement audio.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detect supported MIME type
            const MIME_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac"];
            const mimeType = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type)) || "";

            const options = mimeType ? { mimeType } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                if (cancelDistance > 50) {
                    // Cancelled
                    return;
                }

                const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
                const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                if (audioBlob.size < 1000) return; // Too short

                await uploadAudio(audioBlob, mimeType);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
            toast.error("Accès au microphone refusé.");
        }
    };

    const stopRecording = (shouldCleanup = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
        if (shouldCleanup) onCancel();
    };

    const uploadAudio = async (blob: Blob, mimeType: string) => {
        setIsUploading(true);

        // Map MIME type to extension
        const extensions: Record<string, string> = {
            'audio/webm': 'webm',
            'audio/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'audio/ogg': 'ogg',
            'audio/wav': 'wav',
            'audio/aac': 'aac'
        };
        const ext = extensions[mimeType.split(';')[0]] || 'webm';
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `chat-audios/${fileName}`;

        const { data, error } = await supabase.storage
            .from("chat-audios")
            .upload(filePath, blob);

        if (error) {
            console.error("Upload error:", error);
            // Check for specific error types if possible, or provide general guidance
            if (error.message.includes("403")) {
                toast.error("Erreur de permission (403) : Vérifiez les RLS de Supabase.");
            } else if (error.message.includes("413")) {
                toast.error("Fichier trop volumineux.");
            } else {
                toast.error(`Erreur: ${error.message || "Echec de l'envoi"}`);
            }
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from("chat-audios")
                .getPublicUrl(filePath);
            onSend(publicUrl);
        }
        setIsUploading(false);
    };

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    // Swipe to cancel logic
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        startXRef.current = x;
        startRecording();
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isRecording || startXRef.current === null) return;
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const distance = startXRef.current - x;
        if (distance > 0) {
            setCancelDistance(Math.min(distance, 100));
        }
    };

    const handleTouchEnd = () => {
        if (!isRecording) return;
        if (cancelDistance > 50) {
            stopRecording(true);
        } else {
            stopRecording();
        }
        setCancelDistance(0);
        startXRef.current = null;
    };

    return (
        <div className="flex items-center gap-3 flex-1 bg-white rounded-full px-1.5 py-1.5 border border-zinc-200 shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-3 flex-1 pl-3">
                {/* Status Indicator */}
                <div className="relative flex items-center justify-center w-5 h-5">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                </div>

                <span className="text-sm font-black text-zinc-900 tabular-nums min-w-[40px]">
                    {formatDuration(duration)}
                </span>

                {/* Sliding Cancel Area */}
                <div className="flex-1 relative flex items-center justify-center h-8">
                    <div
                        className="flex items-center gap-2 transition-transform duration-75"
                        style={{ transform: `translateX(-${cancelDistance}px)` }}
                    >
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                            <span className="animate-pulse">←</span> Glisser pour annuler
                        </span>
                    </div>

                    {/* Gradient Fade for text when sliding */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Action Icon / Feedback */}
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 shrink-0 border border-orange-100 shadow-sm transition-all overflow-hidden">
                <div
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                    style={{
                        transform: cancelDistance > 50 ? 'translateY(0)' : 'translateY(100%)',
                        opacity: cancelDistance > 50 ? 1 : 0
                    }}
                >
                    <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                    style={{
                        transform: cancelDistance > 50 ? 'translateY(-100%)' : 'translateY(0)',
                        opacity: cancelDistance > 50 ? 0 : 1
                    }}
                >
                    <Mic className="w-5 h-5 text-orange-600" />
                </div>
            </div>

            {/* Invisible touch/mouse layer */}
            <div
                className="absolute inset-0 z-20 cursor-pointer touch-none"
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {isUploading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center z-30 animate-in fade-in">
                    <div className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full shadow-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-wider">Envoi...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
