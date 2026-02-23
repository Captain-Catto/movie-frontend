"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";

interface Episode {
  episode_number: number;
  name: string;
  air_date: string | null;
  still_path: string | null;
  runtime: number | null;
}

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
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);

  useEffect(() => {
    setSelectedSeason(currentSeason);
  }, [currentSeason]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const response = await apiService.getTVSeasonEpisodes(
          tmdbId,
          selectedSeason
        );
        if (response.success && response.data?.episodes) {
          setEpisodes(response.data.episodes);
        } else {
          setEpisodes([]);
        }
      } catch {
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [tmdbId, selectedSeason]);

  const handleSeasonChange = (newSeason: number) => {
    setSelectedSeason(newSeason);
    router.replace(`/watch/${contentId}?season=${newSeason}&episode=1`, {
      scroll: false,
    });
  };

  const handleEpisodeClick = (episodeNumber: number) => {
    router.replace(
      `/watch/${contentId}?season=${selectedSeason}&episode=${episodeNumber}`,
      { scroll: false }
    );
  };

  const seasonOptions = Array.from(
    { length: numberOfSeasons },
    (_, i) => i + 1
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Episodes</h3>
        <select
          value={selectedSeason}
          onChange={(e) => handleSeasonChange(Number(e.target.value))}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-500 transition-colors"
        >
          {seasonOptions.map((s) => (
            <option key={s} value={s}>
              Season {s}
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
          {episodes.map((ep) => {
            const isActive =
              selectedSeason === currentSeason &&
              ep.episode_number === currentEpisode;
            return (
              <button
                key={ep.episode_number}
                onClick={() => handleEpisodeClick(ep.episode_number)}
                title={ep.name}
                className={`h-10 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                }`}
              >
                {ep.episode_number}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No episodes available</p>
      )}
    </div>
  );
}
