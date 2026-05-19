"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, Link as LinkIcon } from "lucide-react";
import { watchPartyService } from "@/services/watch-party.service";
import { apiService } from "@/services/api";

interface Props {
  contentTitle: string;
  posterUrl?: string;
  movieId?: number;
  tvId?: number;
  season?: number;
  episode?: number;
  onClose: () => void;
}

export default function CreateWatchPartyModal({
  contentTitle,
  posterUrl,
  movieId,
  tvId,
  season,
  episode,
  onClose,
}: Props) {
  const router = useRouter();
  const [streamUrl, setStreamUrl] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tmdbId = movieId ?? tvId;
    const contentType = movieId ? "movie" : tvId ? "tv" : null;

    if (!tmdbId || !contentType) return;

    let cancelled = false;
    setStreamLoading(true);

    apiService
      .getStreamUrlByTmdbId(tmdbId, contentType, { season, episode })
      .then((response) => {
        if (cancelled || !response.success || !response.data?.url) return;
        setStreamUrl((current) => current || response.data?.url || "");
      })
      .catch(() => {
        // Manual input remains available if stream lookup fails.
      })
      .finally(() => {
        if (!cancelled) setStreamLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, tvId, season, episode]);

  const handleCreate = async () => {
    if (!streamUrl.trim()) {
      setError("Vui lòng nhập stream URL");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const party = await watchPartyService.createParty({
        streamUrl: streamUrl.trim(),
        contentTitle,
        movieId,
        tvId,
        season,
        episode,
        posterUrl,
      });
      router.push(`/watch-party/${party.inviteCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-red-500" />
            <h2 className="text-white font-semibold text-lg">Tạo phòng xem chung</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Movie info */}
        <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3 mb-5">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={contentTitle}
              className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{contentTitle}</p>
            {(season || episode) && (
              <p className="text-gray-400 text-xs mt-0.5">
                {season ? `Phần ${season}` : ""}
                {season && episode ? " · " : ""}
                {episode ? `Tập ${episode}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Stream URL input */}
        <div className="mb-5">
          <label className="block text-gray-300 text-sm mb-2">
            <span className="flex items-center gap-1.5">
              <LinkIcon size={14} />
              Stream URL (HLS / MP4)
            </span>
          </label>
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => {
              setStreamUrl(e.target.value);
              setError("");
            }}
            placeholder="https://example.com/stream.m3u8"
            className="w-full bg-gray-800 border border-gray-700 focus:border-red-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder-gray-500"
          />
          <p className="text-gray-500 text-xs mt-1.5">
            {streamLoading
              ? "Đang lấy link stream từ hệ thống..."
              : "Có thể dùng link hệ thống hoặc nhập link stream trực tiếp"}
          </p>
          {error && (
            <p className="text-red-400 text-xs mt-1.5">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !streamUrl.trim()}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Users size={16} />
            )}
            {loading ? "Đang tạo..." : "Tạo phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}
