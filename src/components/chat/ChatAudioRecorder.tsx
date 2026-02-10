"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { encodeToMp3, blobToAudioBuffer } from "@/lib/audioUtils";
import { cn } from "@/lib/utils";

interface ChatAudioRecorderProps {
    onSend: (fileUrl: string) => void;
    onCancel: () => void;
    initialX?: number;
    initialY?: number;
}

export function ChatAudioRecorder({ onSend, onCancel, initialX, initialY }: ChatAudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cancelDistance, setCancelDistance] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startXRef = useRef<number | null>(initialX ?? null);
    const startYRef = useRef<number | null>(initialY ?? null);

    const isRecordingRef = useRef(false);
    const isLockedRef = useRef(false);
    const cancelDistanceRef = useRef(0);

    useEffect(() => {
        isRecordingRef.current = isRecording;
        isLockedRef.current = isLocked;
        cancelDistanceRef.current = cancelDistance;
    }, [isRecording, isLocked, cancelDistance]);

    const startRecording = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices || !window.MediaRecorder) {
            toast.error("Votre navigateur ne supportه pas l'enregistrement audio.");
            onCancel();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Note: We use raw MediaRecorder to catch the stream. 
            // We'll compress it later using AudioContext -> lamejs
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                // If user swiped to cancel and wasn't locked
                if (!isLockedRef.current && cancelDistanceRef.current > 80) {
                    onCancel();
                    return;
                }

                const rawBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
                if (rawBlob.size < 500) {
                    onCancel();
                    return;
                }

                await processAndUpload(rawBlob);
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
            onCancel();
        }
    };

    const stopRecording = (shouldCleanup = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
        if (shouldCleanup) {
            // This is called when we want to fully abort (e.g. Garbage can icon clicked)
            onCancel();
        }
    };

    const processAndUpload = async (rawBlob: Blob) => {
        setIsProcessing(true);
        try {
            let blobToUpload = rawBlob;
            let finalMimeType = rawBlob.type || "audio/webm";

            try {
                // Phase 1: Professional Compression
                console.log("Senior Engineer: Attempting MP3 encoding...", (rawBlob.size / 1024).toFixed(1), "KB");
                const audioBuffer = await blobToAudioBuffer(rawBlob);
                const mp3Blob = await encodeToMp3(audioBuffer);

                // Only use MP3 if it actually saved space and worked
                if (mp3Blob.size > 0) {
                    blobToUpload = mp3Blob;
                    finalMimeType = "audio/mpeg";
                    console.log("Senior Engineer: Compression success.", (mp3Blob.size / 1024).toFixed(1), "KB");
                }
            } catch (compressionError) {
                console.warn("Senior Engineer: MP3 Compression failed, falling back to raw recording.", compressionError);
                // Fallback: stay with rawBlob
            }

            // Phase 2: Upload to Supabase Storage
            const ext = finalMimeType === "audio/mpeg" ? "mp3" : (finalMimeType.split('/')[1]?.split(';')[0] || "webm");
            const fileName = `${Date.now()}.${ext}`;
            const filePath = `chat-audios/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("chat-audios")
                .upload(filePath, blobToUpload, {
                    contentType: finalMimeType,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("chat-audios")
                .getPublicUrl(filePath);

            onSend(publicUrl);
        } catch (error: any) {
            console.error("Critical Audio Error:", error);
            toast.error(`Erreur d'envoi: ${error.message || "Problème de connexion"}`);
            onCancel();
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        startRecording();

        const handleGlobalUp = () => {
            if (isRecordingRef.current && !isLockedRef.current) {
                stopRecording(false);
            }
        };

        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!isRecordingRef.current || isLockedRef.current || startXRef.current === null || startYRef.current === null) return;

            const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            const deltaX = startXRef.current - x;
            const deltaY = startYRef.current - y;

            // Swipe Left to Cancel
            if (deltaX > 0) {
                setCancelDistance(Math.min(deltaX, 150));
            }

            // Swipe Up to Lock
            if (deltaY > 80 && !isLockedRef.current) {
                setIsLocked(true);
                toast.success("Enregistrement verrouillé (Locked)");
            }
        };

        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);
        window.addEventListener('mousemove', handleGlobalMove);
        window.addEventListener('touchmove', handleGlobalMove);

        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('touchmove', handleGlobalMove);
            // Don't stopRecording here as it might trigger on unmount before finish
        };
    }, []);

    const showCancelIcon = cancelDistance > 60;

    return (
        <div className="flex items-center gap-3 flex-1 bg-transparent relative overflow-hidden h-full min-h-[48px] animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 flex-1 pl-3">
                {/* Status Indicator */}
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                    <Mic className="h-4 w-4 text-red-600 relative z-10" />
                </div>

                {/* Counter */}
                <span className="text-sm font-black text-zinc-900 tabular-nums shrink-0">
                    {formatDuration(duration)}
                </span>

                {/* Interaction Clue / Slider */}
                <div className="flex-1 overflow-hidden">
                    <div
                        className="transition-transform duration-75 flex items-center gap-2"
                        style={{ transform: !isLocked ? `translateX(-${cancelDistance}px)` : 'none' }}
                    >
                        {isLocked ? (
                            <div className="flex items-center gap-2 bg-zinc-100/80 px-3 py-1 rounded-full border border-zinc-200">
                                <Lock className="w-3 h-3 text-orange-600" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Verrouillé</span>
                            </div>
                        ) : (
                            <span className="text-[10px] md:text-[11px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap animate-pulse">
                                اسحب لليسار للإلغاء <span className="opacity-40 ml-1">←</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-2 pr-2 shrink-0">
                {isLocked && (
                    <Button
                        onClick={() => stopRecording(true)}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                )}

                <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200",
                    showCancelIcon ? "bg-red-50 text-red-600 scale-110" : "bg-orange-50 text-orange-600",
                    isLocked && "bg-orange-600 text-white shadow-lg active:scale-95 cursor-pointer"
                )}
                    onClick={isLocked ? () => stopRecording(false) : undefined}
                >
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isLocked ? (
                        <Send className="w-5 h-5 ml-0.5" />
                    ) : showCancelIcon ? (
                        <Trash2 className="w-5 h-5 animate-bounce" />
                    ) : (
                        <Mic className="h-6 w-6 animate-pulse" />
                    )}
                </div>
            </div>

            {/* Overlay for processing/sending */}
            {isProcessing && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-30 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-white/10">
                        <div className="relative">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">جاري الضغط...</span>
                            <span className="text-[9px] text-zinc-400 font-bold mt-1">تجهيز الملف فائق السرعة</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
