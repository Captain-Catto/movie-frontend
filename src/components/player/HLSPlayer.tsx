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
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  useEffect(() => { onReadyRef.current = onReady; onErrorRef.current = onError; }, [onReady, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const videoEl = video;

    let destroyed = false;

    const onManifestParsed = () => {
      videoEl.play().catch(() => {});
      onReadyRef.current?.();
    };
    const onHlsError = (_: unknown, data: { fatal: boolean }) => {
      if (data.fatal) onErrorRef.current?.();
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
        videoEl.addEventListener("error", () => onErrorRef.current?.());
      } else {
        onErrorRef.current?.();
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
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-gray-950"
      controls
      autoPlay
      playsInline
      aria-label="Video player"
    >
      <track kind="captions" />
    </video>
  );
}
