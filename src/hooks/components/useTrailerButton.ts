"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { apiService } from "@/services/api";
import type { Video } from "@/types/content.types";

interface UseTrailerButtonOptions {
  movieId: number;
  contentType: "movie" | "tv";
}

interface UseTrailerButtonResult {
  isModalOpen: boolean;
  videos: Video[];
  loading: boolean;
  hasVideos: boolean | null;
  initialCheckDone: boolean;
  openTrailer: () => Promise<void>;
  closeTrailer: () => void;
}

export function useTrailerButton({
  movieId,
  contentType,
}: UseTrailerButtonOptions): UseTrailerButtonResult {
  const [isModalOpen, setIsModalOpen] = useState(false);
  type VideoState = { videos: Video[]; loading: boolean; hasVideos: boolean | null; initialCheckDone: boolean };
  const [videoState, dispatch] = useReducer(
    (s: VideoState, p: Partial<VideoState>): VideoState => ({ ...s, ...p }),
    { videos: [], loading: false, hasVideos: null, initialCheckDone: false }
  );
  const { videos, loading, hasVideos, initialCheckDone } = videoState;

  const fetchVideos = useCallback(async () => {
    if (contentType === "tv") {
      return apiService.getTVVideos(movieId);
    }
    return apiService.getMovieVideos(movieId);
  }, [movieId, contentType]);

  useEffect(() => {
    let isMounted = true;

    const checkVideosAvailability = async () => {
      if (!isMounted) return;
      dispatch({ loading: true });
      try {
        const response = await fetchVideos();

        if (isMounted) {
          if (response.success && response.data?.results) {
            const availableVideos = response.data.results;
            dispatch({ videos: availableVideos, hasVideos: availableVideos.length > 0, loading: false, initialCheckDone: true });
          } else {
            dispatch({ hasVideos: false, videos: [], loading: false, initialCheckDone: true });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error checking videos availability:", err);
        dispatch({ hasVideos: false, videos: [], loading: false, initialCheckDone: true });
      }
    };

    if (movieId > 0) {
      checkVideosAvailability();
    } else {
      dispatch({ hasVideos: false, initialCheckDone: true });
    }

    return () => {
      isMounted = false;
    };
  }, [movieId, fetchVideos]);

  const openTrailer = useCallback(async () => {
    if (videos.length > 0) {
      setIsModalOpen(true);
      return;
    }

    if (hasVideos === false) {
      return;
    }

    dispatch({ loading: true });

    try {
      const response = await fetchVideos();
      if (response.success && response.data?.results) {
        dispatch({ videos: response.data.results, hasVideos: response.data.results.length > 0, loading: false });
      } else {
        dispatch({ videos: [], hasVideos: false, loading: false });
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching videos:", err);
      dispatch({ videos: [], hasVideos: false, loading: false });
      setIsModalOpen(true);
    }
  }, [videos.length, hasVideos, fetchVideos]);

  const closeTrailer = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    isModalOpen,
    videos,
    loading,
    hasVideos,
    initialCheckDone,
    openTrailer,
    closeTrailer,
  };
}
