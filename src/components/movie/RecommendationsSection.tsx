"use client";

import Link from "next/link";
import Image from "next/image";
import { HoverPreviewCard } from "@/components/movie/HoverPreviewCard";
import { useRecommendationsSection } from "@/hooks/components/useRecommendationsSection";
import { mapGenreIdsToNames } from "@/utils/genreMapping";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";

interface RecommendationsProps {
  tmdbId: number;
  contentType: "movie" | "tv";
}

export default function RecommendationsSection({
  tmdbId,
  contentType,
}: RecommendationsProps) {
  const { recommendations, loading, error } = useRecommendationsSection({
    tmdbId,
    contentType,
  });

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
            const rating =
              typeof item.vote_average === "number" && item.vote_average > 0
                ? item.vote_average.toFixed(1)
                : null;

            // Generate correct URL based on content type
            const itemUrl =
              contentType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
            const rawGenres = (item as { genres?: string[] }).genres;
            const incomingGenreNames: string[] = Array.isArray(rawGenres)
              ? rawGenres
              : [];
            const genreNames =
              incomingGenreNames.length > 0
                ? incomingGenreNames
                : item.genre_ids && item.genre_ids.length
                ? mapGenreIdsToNames(item.genre_ids)
                : [];

            return (
              <div key={item.id} className="group relative">
                <Link
                  href={itemUrl}
                  className="block space-y-3 hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={posterPath}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
                      quality={55}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>

                    {rating && (
                      <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-semibold">
                        ★ {rating}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white font-semibold text-sm line-clamp-3 group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>
                    {year && <p className="text-gray-400 text-xs">{year}</p>}
                  </div>
                </Link>

                {/* Desktop hover card (reusable) */}
                <HoverPreviewCard
                  title={title}
                  subtitle={title}
                  image={
                    item.backdrop_path
                      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.backdrop_path}`
                      : posterPath
                  }
                  watchHref={`/watch/${contentType}-${item.id}`}
                  detailHref={itemUrl}
                  rating={rating}
                  year={year}
                  overview={item.overview}
                  contentType={contentType}
                  genreIds={item.genre_ids}
                  genreNames={genreNames}
                  favoriteButton={{
                    id: item.id,
                    tmdbId: item.id,
                    title,
                    poster_path: posterPath,
                    vote_average: item.vote_average,
                    media_type: contentType,
                    overview: item.overview,
                    genres: [],
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
