"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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

  type EpisodeState = { episodes: Episode[]; loading: boolean };
  const [episodeState, dispatch] = useReducer(
    (s: EpisodeState, p: Partial<EpisodeState>): EpisodeState => ({ ...s, ...p }),
    { episodes: [], loading: false }
  );
  const { episodes, loading } = episodeState;

  const [prevSeason, setPrevSeason] = useState(currentSeason);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);

  if (currentSeason !== prevSeason) {
    setPrevSeason(currentSeason);
    setSelectedSeason(currentSeason);
  }

  const seasonEpisodesCacheRef = useRef<Record<number, Episode[]>>({});
  const lastFetchKeyRef = useRef<string | null>(null);
  const currentSeasonRef = useRef(currentSeason);
  currentSeasonRef.current = currentSeason;
  const currentEpisodeRef = useRef(currentEpisode);
  currentEpisodeRef.current = currentEpisode;
  const dsLangRef = useRef(dsLang);
  dsLangRef.current = dsLang;

  useEffect(() => {
    seasonEpisodesCacheRef.current = {};
    lastFetchKeyRef.current = null;
  }, [tmdbId, language]);

  const fetchEpisodes = useCallback(async (season: number) => {
    const cachedEpisodes = seasonEpisodesCacheRef.current[season];
    dispatch({ episodes: cachedEpisodes ?? [], loading: !cachedEpisodes });
    if (cachedEpisodes) return;

    try {
      const response = await apiService.getTVSeasonEpisodes(tmdbId, season, language);
      if (response.success && response.data?.episodes) {
        const normalizedEpisodes = response.data.episodes.map((episode, index) => ({
          ...episode,
          episodeNumber:
            Number.isInteger(episode.episodeNumber) && episode.episodeNumber > 0
              ? episode.episodeNumber
              : index + 1,
          name: episode.name || `Episode ${episode.episodeNumber || index + 1}`,
        }));

        dispatch({ episodes: normalizedEpisodes, loading: false });
        seasonEpisodesCacheRef.current[season] = normalizedEpisodes;

        if (season === currentSeasonRef.current) {
          const nextEpisode = currentEpisodeRef.current + 1;
          const hasNextEpisode = normalizedEpisodes.some((ep) => ep.episodeNumber === nextEpisode);
          if (hasNextEpisode) {
            apiService
              .getStreamUrlByTmdbId(tmdbId, "tv", {
                season,
                episode: nextEpisode,
                dsLang: dsLangRef.current,
                autoplay: true,
                autoNext: true,
              })
              .catch(() => undefined);
          }
        }
      } else {
        dispatch({ episodes: [], loading: false });
      }
    } catch {
      dispatch({ episodes: [], loading: false });
    }
  }, [tmdbId, language]);

  useEffect(() => {
    const key = `${tmdbId}:${selectedSeason}:${language}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    fetchEpisodes(selectedSeason);
  }, [tmdbId, selectedSeason, language, fetchEpisodes]);

  const changeSeason = useCallback(
    (newSeason: number) => {
      if (newSeason === currentSeason && currentEpisode === 1) return;
      setSelectedSeason(newSeason);
      router.replace(`/watch/${contentId}?season=${newSeason}&episode=1`, { scroll: false });
    },
    [contentId, currentSeason, currentEpisode, router]
  );

  const selectEpisode = useCallback(
    (episodeNumber: number) => {
      if (selectedSeason === currentSeason && episodeNumber === currentEpisode) return;
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

  return { episodes, loading, selectedSeason, seasonOptions, changeSeason, selectEpisode };
}
