"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ChatAudioRecorderProps {
    onSend: (fileUrl: string) => void;
    onCancel: () => void;
    initialX?: number;
    initialY?: number;
}

export function ChatAudioRecorder({ onSend, onCancel, initialX, initialY }: ChatAudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
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
            toast.error("Votre navigateur ne supporte pas l'enregistrement audio.");
            onCancel();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Professional Prioritized MIME Types: MP4/AAC for max compatibility
            const MIME_TYPES = [
                "audio/mp4;codecs=mp4a",
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/mp4",
                "audio/ogg;codecs=opus",
                "audio/wav",
                "audio/aac"
            ];

            const mimeType = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type)) || "";
            const options = mimeType ? { mimeType } : {};

            console.log("Senior Engineer: Using MIME Type", mimeType);

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                // If cancelled (distance > 50 and not locked during the recording period)
                // Actually, if it's currently showing cancel state, don't upload
                if (!isLockedRef.current && cancelDistanceRef.current > 50) {
                    return;
                }

                const finalMimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
                const audioBlob = new Blob(chunksRef.current, { type: finalMimeType });
                if (audioBlob.size < 1000) return;

                await uploadAudio(audioBlob, finalMimeType);
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
            onCancel();
        }
    };

    const uploadAudio = async (blob: Blob, mimeType: string) => {
        setIsUploading(true);
        const extensions: Record<string, string> = {
            'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/mpeg': 'mp3',
            'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/aac': 'aac'
        };
        const ext = extensions[mimeType.split(';')[0]] || 'webm';
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `chat-audios/${fileName}`;

        try {
            const { data, error } = await supabase.storage
                .from("chat-audios")
                .upload(filePath, blob);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from("chat-audios")
                .getPublicUrl(filePath);
            onSend(publicUrl);
        } catch (error: any) {
            toast.error(`Erreur d'envoi: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    // Auto-start and Global listeners
    useEffect(() => {
        startRecording();

        const handleGlobalUp = () => {
            if (isRecordingRef.current && !isLockedRef.current) {
                if (cancelDistanceRef.current > 50) {
                    stopRecording(true);
                } else {
                    stopRecording(false);
                }
            }
        };

        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!isRecordingRef.current || isLockedRef.current || startXRef.current === null || startYRef.current === null) return;

            const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            const deltaX = startXRef.current - x;
            const deltaY = startYRef.current - y;

            if (deltaX > 0) setCancelDistance(Math.min(deltaX, 100));

            if (deltaY > 60 && !isLockedRef.current) {
                setIsLocked(true);
                toast.success("Enregistrement verrouillé");
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
            stopRecording(false);
        };
    }, []);

    return (
        <div className="flex items-center gap-3 flex-1 bg-transparent relative overflow-hidden h-full min-h-[48px]">
            <div className="flex items-center gap-3 flex-1 pl-3">
                <div className="relative flex items-center justify-center w-5 h-5">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                </div>

                <span className="text-sm font-black text-zinc-900 tabular-nums">
                    {formatDuration(duration)}
                </span>

                <div className="flex-1 relative flex items-center justify-center">
                    {isLocked ? (
                        <Button
                            onClick={() => stopRecording(true)}
                            variant="ghost" size="sm"
                            className="text-red-600 font-bold text-[10px] uppercase h-8 px-2"
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> Annuler
                        </Button>
                    ) : (
                        <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse whitespace-nowrap">
                            ← إلغاء | ↑ قفل
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 pr-2">
                {isLocked ? (
                    <Button
                        onClick={() => stopRecording(false)}
                        className="bg-orange-600 text-white rounded-full w-10 h-10 p-0 shadow-lg"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                ) : (
                    <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 shrink-0 border border-orange-100">
                        {cancelDistance > 50 ? <Trash2 className="w-5 h-5 text-red-600" /> : <Mic className="w-5 h-5 text-orange-600 animate-pulse" />}
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-30">
                    <div className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full shadow-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="text-xs font-black uppercase">جاري الإرسال...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
