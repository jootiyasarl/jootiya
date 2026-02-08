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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detect supported MIME type
            const MIME_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac"];
            const mimeType = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type)) || "";

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
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
                toast.error("Erreur lors de l'envoi du vocal.");
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
        <div className="flex items-center gap-3 flex-1 bg-zinc-50 rounded-full px-4 py-2 border border-orange-200">
            <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-zinc-700">{formatDuration(duration)}</span>

                {/* Visual feedback for swipe */}
                <div className="flex-1 flex justify-center">
                    <span
                        className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest transition-opacity"
                        style={{ opacity: 1 - cancelDistance / 50 }}
                    >
                        ← Glisser pour annuler
                    </span>
                </div>
            </div>

            <div className="relative group">
                {cancelDistance > 50 ? (
                    <Trash2 className="w-5 h-5 text-red-500 animate-bounce" />
                ) : (
                    <Mic className="w-5 h-5 text-orange-500" />
                )}
            </div>

            <div
                className="absolute inset-0 z-20 cursor-pointer"
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {isUploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-30">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
            )}
        </div>
    );
}
