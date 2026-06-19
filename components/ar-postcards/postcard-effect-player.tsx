"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play, Sparkles } from "lucide-react";
import {
  AR_POSTCARD_EFFECT_LABELS,
  isExternalEffectType,
} from "@/lib/ar-postcard-constants";
import type { PublicArPostcard } from "@/types/ar-postcards";
import { cn } from "@/lib/utils";

interface PostcardEffectPlayerProps {
  postcard: PublicArPostcard;
  className?: string;
}

export function PostcardEffectPlayer({
  postcard,
  className,
}: PostcardEffectPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [externalFailed, setExternalFailed] = useState(false);

  const { effectType } = postcard;
  const poster =
    postcard.animationPosterUrl ||
    postcard.postcardImageUrl ||
    postcard.coverImageUrl ||
    "/images/map-preview.svg";

  if (effectType === "coming_soon") {
    return (
      <ComingSoonBlock postcard={postcard} className={className} />
    );
  }

  if (isExternalEffectType(effectType) && postcard.effectUrl) {
    return (
      <div className={cn("border border-border bg-muted/20 p-6 lg:p-8", className)}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {AR_POSTCARD_EFFECT_LABELS[effectType]}
        </p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Эффект открывается на внешней странице — в браузере или приложении AR.
          Если ссылка не работает, напишите нам через форму ниже.
        </p>
        <a
          href={postcard.effectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setExternalFailed(false)}
          className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90"
        >
          Открыть эффект
          <ExternalLink size={14} />
        </a>
        {externalFailed && (
          <p className="mt-4 text-sm text-muted-foreground">
            Не удалось открыть внешний эффект. Попробуйте позже или оставьте вопрос в форме.
          </p>
        )}
      </div>
    );
  }

  if (effectType === "audio_story" && postcard.audioUrl) {
    return (
      <div className={cn("border border-border p-6 lg:p-8", className)}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Аудиоистория
        </p>
        {postcard.postcardImageUrl && (
          <div className="relative aspect-[4/3] max-w-md mb-6 overflow-hidden border border-border bg-muted">
            <Image
              src={postcard.postcardImageUrl}
              alt={postcard.postcardImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}
        <audio controls preload="none" className="w-full max-w-md">
          <source src={postcard.audioUrl} />
          Ваш браузер не поддерживает аудио.
        </audio>
        {postcard.audioTranscript ? (
          <div className="mt-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {postcard.audioTranscript}
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Текст истории появится здесь позже.
          </p>
        )}
      </div>
    );
  }

  if (effectType === "animated_image") {
    return (
      <div className={cn("relative overflow-hidden border border-border", className)}>
        <div className="postcard-ken-burns relative aspect-[4/3] bg-muted">
          <Image
            src={postcard.postcardImageUrl || poster}
            alt={postcard.postcardImageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-city-ink/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs uppercase tracking-widest text-white/90">
            <Sparkles size={14} />
            Ожившая открытка
          </div>
        </div>
      </div>
    );
  }

  if (effectType === "video_page" && postcard.animationVideoUrl) {
    return (
      <div className={cn("relative overflow-hidden border border-border bg-city-ink", className)}>
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster={poster}
            preload="none"
            playsInline
            controls={videoPlaying}
            onPlay={() => setVideoPlaying(true)}
          >
            <source src={postcard.animationVideoUrl} />
          </video>
          {!videoPlaying && (
            <button
              type="button"
              onClick={() => {
                const el = videoRef.current;
                if (!el) return;
                el.muted = false;
                void el.play();
                setVideoPlaying(true);
              }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-city-ink/50 text-white transition-opacity hover:bg-city-ink/40"
              aria-label="Воспроизвести видео"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/10 backdrop-blur-sm">
                <Play size={28} className="ml-1" fill="currentColor" />
              </span>
              <span className="text-xs uppercase tracking-[0.25em]">
                Смотреть ожившую открытку
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return <ComingSoonBlock postcard={postcard} className={className} />;
}

function ComingSoonBlock({
  postcard,
  className,
}: {
  postcard: PublicArPostcard;
  className?: string;
}) {
  const image = postcard.postcardImageUrl || postcard.coverImageUrl;

  return (
    <div className={cn("border border-border", className)}>
      {image ? (
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={image}
            alt={postcard.postcardImageAlt}
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-city-ink/50 p-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-2">
                Скоро
              </p>
              <p className="text-lg text-white font-light max-w-sm">
                Оживший эффект для этой открытки ещё в работе — мы честно не
                показываем фейковое видео.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">Эффект для этой открытки скоро появится.</p>
        </div>
      )}
    </div>
  );
}
