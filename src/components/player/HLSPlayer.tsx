"use client";

import { useEffect, useRef } from "react";

interface HLSPlayerProps {
  src: string;
  onReady?: () => void;
  onError?: () => void;
}

export default function HLSPlayer({ src, onReady, onError }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<unknown>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const videoEl = video;

    let destroyed = false;

    const onManifestParsed = () => {
      videoEl.play().catch(() => {});
      onReady?.();
    };
    const onHlsError = (_: unknown, data: { fatal: boolean }) => {
      if (data.fatal) onError?.();
    };

    async function init() {
      if (destroyed) return;

      const Hls = (await import("hls.js")).default;

      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.on(Hls.Events.ERROR, onHlsError);
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari)
        videoEl.src = src;
        videoEl.addEventListener("loadedmetadata", onManifestParsed);
        videoEl.addEventListener("error", () => onError?.());
      } else {
        onError?.();
      }
    }

    init();

    return () => {
      destroyed = true;
      const hls = hlsRef.current as {
        off(event: string, handler: unknown): void;
        destroy(): void;
      } | null;
      if (hls) {
        hls.off("hlsManifestParsed", onManifestParsed);
        hls.off("hlsError", onHlsError);
        hls.destroy();
      }
      hlsRef.current = null;
    };
  }, [src, onReady, onError]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      controls
      autoPlay
      playsInline
    />
  );
}
