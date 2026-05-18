"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";

export interface VideoPlayerRef {
  play(): void;
  pause(): void;
  seekTo(time: number): void;
  getCurrentTime(): number;
}

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  subtitles?: Array<{
    src: string;
    label: string;
    language: string;
    default?: boolean;
  }>;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onSeek?: (currentTime: number) => void;
  disableControls?: boolean;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(function VideoPlayer(
  {
    src,
    title,
    poster,
    subtitles = [],
    onTimeUpdate,
    onEnded,
    onPlay,
    onPause,
    onSeek,
    disableControls = false,
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Prevents programmatic sync from triggering outbound callbacks
  const isExternalSync = useRef(false);

  useImperativeHandle(ref, () => ({
    play() {
      if (videoRef.current) {
        isExternalSync.current = true;
        void videoRef.current.play().finally(() => {
          isExternalSync.current = false;
        });
      }
    },
    pause() {
      if (videoRef.current) {
        isExternalSync.current = true;
        videoRef.current.pause();
        isExternalSync.current = false;
      }
    },
    seekTo(time: number) {
      if (videoRef.current) {
        isExternalSync.current = true;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
        isExternalSync.current = false;
      }
    },
    getCurrentTime() {
      return videoRef.current?.currentTime ?? 0;
    },
  }));

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (disableControls) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disableControls) return;
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      if (!isExternalSync.current) onSeek?.(seekTime);
    }
  };

  const skipTime = (seconds: number) => {
    if (disableControls || !videoRef.current) return;
    const newTime = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = newTime;
    if (!isExternalSync.current) onSeek?.(newTime);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSettings = () => setShowSettings(!showSettings);

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!isExternalSync.current) {
      onPlay?.(videoRef.current?.currentTime ?? 0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (!isExternalSync.current) {
      onPause?.(videoRef.current?.currentTime ?? 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleMouseMove = () => {
      setShowControls(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    const handleMouseLeave = () => setShowControls(false);
    const playerElement = videoRef.current?.parentElement;
    playerElement?.addEventListener("mousemove", handleMouseMove);
    playerElement?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      playerElement?.removeEventListener("mousemove", handleMouseMove);
      playerElement?.removeEventListener("mouseleave", handleMouseLeave);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showSettings && !target.closest(".settings-dropdown")) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-auto"
        poster={poster}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onClick={togglePlay}
        src={src}
      >
        <source src={src} type="video/mp4" />
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            src={subtitle.src}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.default}
          />
        ))}
        Your browser does not support HTML5 video.
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              disabled={disableControls}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-6 transition-all shadow-lg hover:scale-110 cursor-pointer"
            >
              <Play size={32} className="text-white ml-1" fill="currentColor" />
            </button>
          </div>
        )}

        {disableControls && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              Được điều khiển bởi host
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              disabled={disableControls}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                  (currentTime / duration) * 100
                }%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                disabled={disableControls}
                className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" />
                )}
              </button>

              <button
                onClick={() => skipTime(-10)}
                disabled={disableControls}
                className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Rewind 10 seconds"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => skipTime(10)}
                disabled={disableControls}
                className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Forward 10 seconds"
              >
                <SkipForward size={20} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  title="Adjust volume"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative settings-dropdown">
                <button
                  onClick={toggleSettings}
                  className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-3 min-w-[180px] border border-gray-600">
                    <div className="text-white text-sm font-medium mb-2">Playback speed</div>
                    <div className="space-y-1">
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => {
                            changePlaybackSpeed(speed);
                            setShowSettings(false);
                          }}
                          className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors cursor-pointer ${
                            playbackSpeed === speed
                              ? "bg-red-600 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {speed === 1 ? "Normal" : `${speed}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer"
                title="Fullscreen"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
});

export default VideoPlayer;
