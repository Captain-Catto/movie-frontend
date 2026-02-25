"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasVideos, setHasVideos] = useState<boolean | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (contentType === "tv") {
      return apiService.getTVVideos(movieId);
    }
    return apiService.getMovieVideos(movieId);
  }, [movieId, contentType]);

  useEffect(() => {
    let isMounted = true;

    const checkVideosAvailability = async () => {
      setLoading(true);
      try {
        const response = await fetchVideos();
        if (!isMounted) return;

        if (response.success && response.data?.results) {
          const availableVideos = response.data.results;
          setVideos(availableVideos);
          setHasVideos(availableVideos.length > 0);
        } else {
          setHasVideos(false);
          setVideos([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error checking videos availability:", err);
        setHasVideos(false);
        setVideos([]);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialCheckDone(true);
        }
      }
    };

    if (movieId > 0) {
      checkVideosAvailability();
    } else {
      setHasVideos(false);
      setInitialCheckDone(true);
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

    setLoading(true);

    try {
      const response = await fetchVideos();
      if (response.success && response.data?.results) {
        setVideos(response.data.results);
        setHasVideos(response.data.results.length > 0);
      } else {
        setVideos([]);
        setHasVideos(false);
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setVideos([]);
      setHasVideos(false);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
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
