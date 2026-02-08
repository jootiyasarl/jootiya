"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAudioPlayerProps {
    url: string;
    isMe: boolean;
}

export function ChatAudioPlayer({ url, isMe }: ChatAudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            setDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, [url]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className={cn(
            "flex items-center gap-3 py-2 px-1 min-w-[200px] md:min-w-[240px]",
            isMe ? "text-white" : "text-zinc-800"
        )}>
            <button
                onClick={togglePlay}
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90",
                    isMe ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                )}
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.01"
                    value={currentTime}
                    onChange={handleProgressChange}
                    className={cn(
                        "w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-current",
                        isMe ? "bg-white/30" : "bg-zinc-200"
                    )}
                />
                <div className="flex justify-between text-[10px] font-bold opacity-70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <Volume2 className="w-4 h-4 opacity-50 shrink-0" />
        </div>
    );
}
