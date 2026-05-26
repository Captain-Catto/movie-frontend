"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import type { MovieCardData } from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import HomePosterRail from "@/components/movie/HomePosterRail";
import Skeleton from "@/components/ui/Skeleton";
import { ChevronRight } from "lucide-react";

interface UpcomingMoviesLoaderProps {
  title: string;
  viewMoreLabel: string;
  language: string;
}

export function UpcomingSkeleton({ title }: { title: string }) {
  return (
    <section className="home-poster-rail">
      <div className="home-poster-rail__header">
        <div className="home-poster-rail__title-link cursor-default">
          <h2>{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </div>
      </div>
      <div className="home-poster-rail__content">
        <div className="home-poster-rail__scroller overflow-x-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`upcoming-skeleton-${i}`} className="home-poster-rail-card select-none">
              <div className="home-poster-rail-card__thumb relative aspect-[2/3] min-h-[15rem] overflow-hidden rounded-lg bg-gray-800/60">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="home-poster-rail-card__info space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function UpcomingMoviesLoader({
  title,
  viewMoreLabel,
  language,
}: UpcomingMoviesLoaderProps) {
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchUpcoming() {
      try {
        const response = await apiService.getUpcomingMovies({
          page: 1,
          limit: 24, // HOME_UPCOMING_SECTION_LIMIT
          language,
        });

        if (isMounted) {
          if (response.success && Array.isArray(response.data)) {
            const mapped = mapMoviesToFrontend(response.data as never[], language) as MovieCardData[];
            setMovies(mapped);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load upcoming movies:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUpcoming();

    return () => {
      isMounted = false;
    };
  }, [language]);

  if (isLoading) {
    return <UpcomingSkeleton title={title} />;
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <HomePosterRail
      title={title}
      href="/movies/upcoming"
      viewMoreLabel={viewMoreLabel}
      movies={movies}
    />
  );
}
