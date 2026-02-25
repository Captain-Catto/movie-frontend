"use client";

import { useEpisodePicker } from "@/hooks/components/useEpisodePicker";
import { useLanguage } from "@/contexts/LanguageContext";

interface EpisodePickerProps {
  tmdbId: number;
  numberOfSeasons: number;
  currentSeason: number;
  currentEpisode: number;
  contentId: string;
}

export default function EpisodePicker({
  tmdbId,
  numberOfSeasons,
  currentSeason,
  currentEpisode,
  contentId,
}: EpisodePickerProps) {
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  const {
    episodes,
    loading,
    selectedSeason,
    seasonOptions,
    changeSeason,
    selectEpisode,
  } = useEpisodePicker({
    tmdbId,
    numberOfSeasons,
    currentSeason,
    currentEpisode,
    contentId,
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {isVietnamese ? "Tập phim" : "Episodes"}
        </h3>
        <select
          value={selectedSeason}
          onChange={(e) => changeSeason(Number(e.target.value))}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-500 transition-colors"
        >
          {seasonOptions.map((s) => (
            <option key={s} value={s}>
              {isVietnamese ? `Mùa ${s}` : `Season ${s}`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
          {episodes.map((ep, index) => {
            const isActive =
              selectedSeason === currentSeason &&
              ep.episodeNumber === currentEpisode;
            const episodeKey =
              ep.id !== undefined
                ? `${selectedSeason}-${ep.id}`
                : `${selectedSeason}-${ep.episodeNumber}-${ep.airDate ?? "na"}-${index}`;

            return (
              <button
                key={episodeKey}
                onClick={() => selectEpisode(ep.episodeNumber)}
                title={ep.name}
                className={`h-10 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                }`}
              >
                {ep.episodeNumber}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">
          {isVietnamese ? "Không có tập phim khả dụng" : "No episodes available"}
        </p>
      )}
    </div>
  );
}
