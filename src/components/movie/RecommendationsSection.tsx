"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "@/services/api";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";

interface RecommendationsProps {
  tmdbId: number;
  contentType: "movie" | "tv";
}

interface RecommendationItem {
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
}

export default function RecommendationsSection({
  tmdbId,
  contentType,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          contentType === "movie"
            ? await apiService.getMovieRecommendations(tmdbId)
            : await apiService.getTVRecommendations(tmdbId);

        if (response.success) {
          setRecommendations(response.data.slice(0, 12));
        } else {
          setError(response.error || "Failed to load recommendations");
        }
      } catch (err) {
        setError("Failed to load recommendations");
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tmdbId) {
      fetchRecommendations();
    }
  }, [tmdbId, contentType]);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[2/3] bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {recommendations.map((item) => {
            const title = item.title || item.name || "Untitled";
            const posterPath = item.poster_path
              ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.poster_path}`
              : FALLBACK_POSTER;
            const year = item.release_date
              ? new Date(item.release_date).getFullYear()
              : item.first_air_date
              ? new Date(item.first_air_date).getFullYear()
              : "";

            // Generate correct URL based on content type
            const itemUrl =
              contentType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

            return (
              <Link
                key={item.id}
                href={itemUrl}
                className="group block space-y-3 hover:scale-105 transition-transform duration-300"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={posterPath}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>

                  {item.vote_average && item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-semibold">
                      ★ {item.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {title}
                  </h3>
                  {year && <p className="text-gray-400 text-xs">{year}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
