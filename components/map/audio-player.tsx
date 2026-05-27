"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-border p-4 bg-background",
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors duration-200 shrink-0"
          aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-xs font-medium text-foreground truncate mb-1">
              {title}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Volume2 size={12} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">Аудиогид</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground tabular-nums shrink-0">
          {duration ? formatTime(duration) : "--:--"}
        </p>
      </div>

      <div
        className="relative h-1 bg-muted rounded-full cursor-pointer overflow-hidden"
        onClick={handleProgressClick}
        role="slider"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Прогресс воспроизведения"
      >
        <div
          className="absolute inset-y-0 left-0 bg-baikal rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
