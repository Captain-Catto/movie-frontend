"use client";

import { useEffect, useReducer } from "react";
import { apiService } from "@/services/api";

export interface RecommendationItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
}

function normalizeItem(raw: Record<string, unknown>): RecommendationItem {
  return {
    id: raw.id as number,
    title: (raw.title ?? raw.name) as string | undefined,
    name: raw.name as string | undefined,
    poster_path: ((raw.posterPath ?? raw.poster_path) as string | null) ?? null,
    backdrop_path: ((raw.backdropPath ?? raw.backdrop_path) as string | null) ?? null,
    overview: raw.overview as string | undefined,
    vote_average: (raw.voteAverage ?? raw.vote_average) as number | undefined,
    release_date: (raw.releaseDate ?? raw.release_date) as string | undefined,
    first_air_date: (raw.firstAirDate ?? raw.first_air_date) as string | undefined,
    media_type: raw.mediaType as string | undefined,
    genre_ids: ((raw.genreIds ?? raw.genre_ids) as number[]) ?? [],
  };
}

export interface UseRecommendationsSectionOptions {
  tmdbId: number;
  contentType: "movie" | "tv";
}

export interface UseRecommendationsSectionResult {
  recommendations: RecommendationItem[];
  loading: boolean;
  error: string | null;
}

export function useRecommendationsSection({
  tmdbId,
  contentType,
}: UseRecommendationsSectionOptions): UseRecommendationsSectionResult {
  type State = { recommendations: RecommendationItem[]; loading: boolean; error: string | null };
  const [state, dispatch] = useReducer(
    (s: State, p: Partial<State>): State => ({ ...s, ...p }),
    { recommendations: [], loading: true, error: null }
  );

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      if (!isMounted) return;
      dispatch({ loading: true, error: null });

      try {
        const response =
          contentType === "movie"
            ? await apiService.getMovieRecommendations(tmdbId)
            : await apiService.getTVRecommendations(tmdbId);

        if (isMounted) {
          if (response.success && Array.isArray(response.data)) {
            dispatch({
              recommendations: (response.data as unknown as Record<string, unknown>[]).slice(0, 12).map(normalizeItem),
              loading: false,
            });
          } else {
            dispatch({ recommendations: [], error: response.error || "Failed to load recommendations", loading: false });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        dispatch({ recommendations: [], error: "Failed to load recommendations", loading: false });
        console.error("Error fetching recommendations:", err);
      }
    };

    if (tmdbId > 0) {
      fetchRecommendations();
    } else {
      dispatch({ recommendations: [], loading: false });
    }

    return () => {
      isMounted = false;
    };
  }, [tmdbId, contentType]);

  return { recommendations: state.recommendations, loading: state.loading, error: state.error };
}
