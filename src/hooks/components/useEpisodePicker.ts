"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDsLanguageFromLanguage } from "@/constants/app.constants";
import type { Episode } from "@/types/content.types";

interface UseEpisodePickerOptions {
  tmdbId: number;
  numberOfSeasons: number;
  currentSeason: number;
  currentEpisode: number;
  contentId: string;
}

interface UseEpisodePickerResult {
  episodes: Episode[];
  loading: boolean;
  selectedSeason: number;
  seasonOptions: number[];
  changeSeason: (newSeason: number) => void;
  selectEpisode: (episodeNumber: number) => void;
}

export function useEpisodePicker({
  tmdbId,
  numberOfSeasons,
  currentSeason,
  currentEpisode,
  contentId,
}: UseEpisodePickerOptions): UseEpisodePickerResult {
  const router = useRouter();
  const { language } = useLanguage();
  const dsLang = getDsLanguageFromLanguage(language);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const seasonEpisodesCacheRef = useRef<Record<number, Episode[]>>({});

  useEffect(() => {
    setSelectedSeason(currentSeason);
  }, [currentSeason]);

  useEffect(() => {
    seasonEpisodesCacheRef.current = {};
  }, [tmdbId, language]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      const cachedEpisodes = seasonEpisodesCacheRef.current[selectedSeason];
      if (cachedEpisodes) {
        setEpisodes(cachedEpisodes);
        return;
      }

      setLoading(true);
      try {
        const response = await apiService.getTVSeasonEpisodes(
          tmdbId,
          selectedSeason,
          language
        );
        if (response.success && response.data?.episodes) {
          const normalizedEpisodes = response.data.episodes.map(
            (episode, index) => ({
              ...episode,
              episodeNumber:
                Number.isInteger(episode.episodeNumber) &&
                episode.episodeNumber > 0
                  ? episode.episodeNumber
                  : index + 1,
              name:
                episode.name ||
                `Episode ${episode.episodeNumber || index + 1}`,
            })
          );

          setEpisodes(normalizedEpisodes);
          seasonEpisodesCacheRef.current[selectedSeason] = normalizedEpisodes;
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
  }, [tmdbId, selectedSeason, language]);

  useEffect(() => {
    if (selectedSeason !== currentSeason || episodes.length === 0) return;

    const nextEpisode = currentEpisode + 1;
    const hasNextEpisode = episodes.some(
      (ep) => ep.episodeNumber === nextEpisode
    );
    if (!hasNextEpisode) return;

    apiService
      .getStreamUrlByTmdbId(tmdbId, "tv", {
        season: selectedSeason,
        episode: nextEpisode,
        dsLang,
        autoplay: true,
        autoNext: true,
      })
      .catch(() => undefined);
  }, [tmdbId, selectedSeason, currentSeason, currentEpisode, episodes, dsLang]);

  const changeSeason = useCallback(
    (newSeason: number) => {
      if (newSeason === currentSeason && currentEpisode === 1) return;
      setSelectedSeason(newSeason);
      router.replace(`/watch/${contentId}?season=${newSeason}&episode=1`, {
        scroll: false,
      });
    },
    [contentId, currentSeason, currentEpisode, router]
  );

  const selectEpisode = useCallback(
    (episodeNumber: number) => {
      if (selectedSeason === currentSeason && episodeNumber === currentEpisode) {
        return;
      }
      router.replace(
        `/watch/${contentId}?season=${selectedSeason}&episode=${episodeNumber}`,
        { scroll: false }
      );
    },
    [contentId, currentEpisode, currentSeason, router, selectedSeason]
  );

  const seasonOptions = useMemo(
    () => Array.from({ length: numberOfSeasons }, (_, i) => i + 1),
    [numberOfSeasons]
  );

  return {
    episodes,
    loading,
    selectedSeason,
    seasonOptions,
    changeSeason,
    selectEpisode,
  };
}
