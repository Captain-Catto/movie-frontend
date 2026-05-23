"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContentDetail } from "@/hooks/data/useContentDetail";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { ExternalLink, Star, Clock, Globe, Film } from "lucide-react";

const toTmdbImageUrl = (
  value: string | null | undefined,
  size: string
): string | null => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${TMDB_IMAGE_BASE_URL}/${size}${value}`;
  return value;
};

type ContentImageFields = {
  posterPath?: string | null;
  poster_path?: string | null;
  posterUrl?: string | null;
  backdropPath?: string | null;
  backdrop_path?: string | null;
  backdropUrl?: string | null;
};

interface ContentDetailModalProps {
  open: boolean;
  onClose: () => void;
  tmdbId: number;
  contentType: "movie" | "tv";
}

export function ContentDetailModal({
  open,
  onClose,
  tmdbId,
  contentType,
}: ContentDetailModalProps) {
  const { data, loading } = useContentDetail({
    id: tmdbId,
    type: contentType,
    fetchRecommendations: false,
    fetchVideos: false,
    enabled: open && tmdbId > 0,
  });

  const content = data?.content;
  const credits = data?.credits;
  const imageFields = content as ContentImageFields | null | undefined;

  const posterUrl =
    toTmdbImageUrl(imageFields?.posterUrl, TMDB_POSTER_SIZE) ||
    toTmdbImageUrl(imageFields?.posterPath, TMDB_POSTER_SIZE) ||
    toTmdbImageUrl(imageFields?.poster_path, TMDB_POSTER_SIZE);
  const backdropUrl =
    toTmdbImageUrl(imageFields?.backdropUrl, TMDB_BACKDROP_SIZE) ||
    toTmdbImageUrl(imageFields?.backdropPath, TMDB_BACKDROP_SIZE) ||
    toTmdbImageUrl(imageFields?.backdrop_path, TMDB_BACKDROP_SIZE);

  const title =
    content && "title" in content
      ? (content as { title: string }).title
      : content && "name" in content
      ? (content as { name: string }).name
      : "Unknown";

  const overview =
    content && "overview" in content
      ? (content as { overview: string }).overview
      : "";

  const releaseDate =
    content && "releaseDate" in content
      ? (content as { releaseDate: string }).releaseDate
      : content && "firstAirDate" in content
      ? (content as { firstAirDate: string }).firstAirDate
      : "";

  const voteAverage =
    content && "voteAverage" in content
      ? Number((content as { voteAverage: number | string }).voteAverage)
      : 0;
  const hasRating = Number.isFinite(voteAverage) && voteAverage > 0;

  const runtime =
    content && "runtime" in content
      ? (content as { runtime: number }).runtime
      : 0;

  const genres =
    content && "genres" in content
      ? (content as { genres: Array<{ id: number; name: string }> }).genres
      : content && "genreNames" in content
      ? (content as { genreNames: string[] }).genreNames?.map(
          (name: string, i: number) => ({ id: i, name })
        )
      : [];

  const originCountry =
    content && "originCountry" in content
      ? (content as { originCountry: string[] }).originCountry
      : [];

  const status =
    content && "status" in content
      ? (content as { status: string }).status
      : "";

  const castList = credits?.cast?.slice(0, 6) || [];
  const director = credits?.crew?.find(
    (p) => p.job === "Director"
  );

  const detailUrl =
    contentType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="!bg-gray-900 !border-gray-700 !max-w-3xl !max-h-[90vh] overflow-y-auto !text-white"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {loading ? "Loading..." : title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Content details, metadata, cast, and actions for {loading ? "the selected title" : title}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-gray-800 rounded-lg" />
            <div className="flex gap-4">
              <div className="w-32 h-48 bg-gray-800 rounded-lg shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-800 rounded w-1/2" />
                <div className="h-4 bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            </div>
          </div>
        ) : content ? (
          <div className="space-y-4">
            {/* Backdrop */}
            {backdropUrl && (
              <div className="relative h-52 rounded-lg overflow-hidden">
                <Image
                  src={backdropUrl}
                  alt={title}
                  fill
                  sizes="700px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
              </div>
            )}

            {/* Main info — poster overlaps the backdrop with negative margin */}
            <div className="flex gap-4">
              {/* Poster */}
              <div
                className={`relative w-28 shrink-0 rounded-lg overflow-hidden bg-gray-800 shadow-xl ring-2 ring-gray-700 z-10 ${backdropUrl ? "-mt-20 h-44" : "h-44"}`}
              >
                <Image
                  src={posterUrl || FALLBACK_POSTER}
                  alt={title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-3">
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-2">
                  {hasRating && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                      <Star className="size-3" />
                      {voteAverage.toFixed(1)}
                    </span>
                  )}
                  {releaseDate && (
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {releaseDate.substring(0, 4)}
                    </span>
                  )}
                  {runtime > 0 && (
                    <span className="flex items-center gap-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      <Clock className="size-3" />
                      {runtime} min
                    </span>
                  )}
                  {status && (
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {status}
                    </span>
                  )}
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-semibold capitalize">
                    {contentType === "tv" ? "TV Series" : "Movie"}
                  </span>
                </div>

                {/* Genres */}
                {genres && genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {genres.map(
                      (g: { id: number; name: string }, i: number) => (
                        <span
                          key={g.id ?? i}
                          className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full text-xs"
                        >
                          {g.name}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Country */}
                {originCountry && originCountry.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="size-3" />
                    {originCountry.join(", ")}
                  </div>
                )}

                {/* Director */}
                {director && (
                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">Director:</span>{" "}
                    <span className="text-white">
                      {director.name}
                    </span>
                  </div>
                )}

                {/* TMDB ID */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Film className="size-3" />
                  TMDB ID: {tmdbId}
                </div>
              </div>
            </div>

            {/* Overview */}
            {overview && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">
                  Overview
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {overview}
                </p>
              </div>
            )}

            {/* Cast */}
            {castList.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  Cast
                </h4>
                <div className="flex flex-wrap gap-2">
                  {castList.map(
                    (member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-gray-800 rounded-lg px-2 py-1"
                      >
                        {member.profile_path && (
                          <Image
                            src={`${TMDB_IMAGE_BASE_URL}/w45${member.profile_path}`}
                            alt={member.name}
                            width={24}
                            height={24}
                            className="rounded-full object-cover size-6"
                          />
                        )}
                        <div className="text-xs">
                          <span className="text-white">{member.name}</span>
                          {member.character && (
                            <span className="text-gray-500">
                              {" "}
                              as {member.character}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <a
                href={detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                <ExternalLink className="size-4" />
                View on Site
              </a>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Content not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
