"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";

export interface RecommendationItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
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
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          contentType === "movie"
            ? await apiService.getMovieRecommendations(tmdbId)
            : await apiService.getTVRecommendations(tmdbId);

        if (!isMounted) return;

        if (response.success && Array.isArray(response.data)) {
          setRecommendations(response.data.slice(0, 12));
        } else {
          setRecommendations([]);
          setError(response.error || "Failed to load recommendations");
        }
      } catch (err) {
        if (!isMounted) return;
        setRecommendations([]);
        setError("Failed to load recommendations");
        console.error("Error fetching recommendations:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (tmdbId > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [tmdbId, contentType]);

  return { recommendations, loading, error };
}
