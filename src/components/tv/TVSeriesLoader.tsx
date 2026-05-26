"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import Skeleton from "@/components/ui/Skeleton";
import { ChevronRight } from "lucide-react";
import { getHomePageUiMessages } from "@/lib/ui-messages";

interface TVSeriesLoaderProps {
  language: string;
}

// 1. Wide Cover Rail Skeleton (On The Air TV Series)
function WideCoverSkeletonList({ title }: { title: string }) {
  return (
    <section className="home-wide-cover-rail">
      <div className="home-wide-cover-rail__header">
        <div className="home-wide-cover-rail__title-link cursor-default">
          <h2>{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </div>
      </div>
      <div className="home-wide-cover-rail__content">
        <div className="home-wide-cover-rail__scroller overflow-x-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`wide-skeleton-${i}`} className="home-wide-cover-card select-none">
              <div className="home-wide-cover-card__cover relative aspect-[2.2/1] min-h-[12.4rem] rounded-lg overflow-hidden bg-gray-800/60">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="home-wide-cover-card__body grid grid-cols-[5rem_minmax(0,1fr)] gap-[1.25rem] min-h-[6.2rem] -mt-[1.55rem] px-[1.2rem] relative z-2">
                <div className="home-wide-cover-card__poster relative w-20 aspect-[2/3] overflow-hidden rounded bg-gray-900 shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.35)]">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="home-wide-cover-card__info pb-[0.55rem] space-y-2 self-end">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 2. Feature Slider Skeleton (Popular TV Series)
function FeatureSliderSkeleton({ title }: { title: string }) {
  return (
    <section className="home-feature-slider">
      <div className="home-feature-slider__header">
        <div className="home-feature-slider__title-link cursor-default">
          <h2>{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </div>
      </div>
      <div className="home-feature-slider__stage relative overflow-hidden bg-gray-800/60 select-none">
        <Skeleton className="absolute inset-0" />
        
        {/* Matches padding, alignment, and grid system of .home-feature-slider__content */}
        <div className="home-feature-slider__content relative z-3 w-full h-full flex flex-col justify-start">
          <div className="space-y-4 max-w-[500px]">
            {/* Title Skeleton */}
            <Skeleton className="h-9 w-2/3" />
            
            {/* Alias Title Skeleton */}
            <Skeleton className="h-4 w-1/2" />
            
            {/* Meta Tags Skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            {/* Genres Skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="w-[3.7rem] h-[3.7rem] rounded-full" />
              <div className="flex rounded-full overflow-hidden border border-white/5 bg-white/5">
                <Skeleton className="w-[3.4rem] h-[3rem]" />
                <Skeleton className="w-[3.4rem] h-[3rem]" />
              </div>
            </div>
          </div>
        </div>

        {/* Matches .home-feature-slider__thumbs absolute positioned rail at the bottom */}
        <div className="home-feature-slider__thumbs select-none pointer-events-none">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={`thumb-skeleton-${idx}`} className="relative w-[4.15rem] aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/80 flex-shrink-0">
              <Skeleton className="absolute inset-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. Top Ten TV Series Skeleton
function TopTenTVSkeleton({ title }: { title: string }) {
  return (
    <section className="home-top-ten">
      <h2>{title}</h2>
      <div className="home-top-ten__content">
        <div className="home-top-ten__scroller overflow-x-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`top-ten-tv-skeleton-${i}`} className="home-top-ten-card select-none">
              <div className="home-top-ten-card__thumb relative aspect-[2/3] min-h-[26.75rem] rounded-lg overflow-hidden bg-gray-800/60">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="home-top-ten-card__info grid grid-cols-[3.4rem_minmax(0,1fr)] gap-[0.85rem] p-[1rem_0.2rem_0] items-center">
                <Skeleton className="h-10 w-full rounded bg-gray-700/80" />
                <div className="home-top-ten-card__text space-y-2 flex-grow">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TVSeriesSectionsSkeleton({ language }: { language: string }) {
  const labels = getHomePageUiMessages(language);

  return (
    <div className="space-y-8">
      <div className="py-8">
        <WideCoverSkeletonList title={labels.onTheAir} />
      </div>
      <div className="py-8">
        <FeatureSliderSkeleton title={labels.popularTVSeries} />
      </div>
      <div className="py-8">
        <TopTenTVSkeleton title={`Top 10 ${labels.topRatedTVSeries}`} />
      </div>
    </div>
  );
}

export default function TVSeriesLoader({ language }: TVSeriesLoaderProps) {
  const [onTheAir, setOnTheAir] = useState<MovieCardData[]>([]);
  const [popular, setPopular] = useState<MovieCardData[]>([]);
  const [topRated, setTopRated] = useState<MovieCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTVData() {
      try {
        const [onTheAirRes, popularRes, topRatedRes] = await Promise.all([
          apiService.getOnTheAirTVSeries({ page: 1, limit: 6, language }),
          apiService.getPopularTVSeries({ page: 1, limit: 15, language }),
          apiService.getTopRatedTVSeries({ page: 1, limit: 10, language }),
        ]);

        if (isMounted) {
          const mapTV = (items: unknown) => {
            if (!Array.isArray(items)) return [];
            try {
              return mapTVSeriesToFrontendList(items as TVSeries[], language) as MovieCardData[];
            } catch {
              return [];
            }
          };

          setOnTheAir(mapTV(onTheAirRes.success ? onTheAirRes.data : []));
          setPopular(mapTV(popularRes.success ? popularRes.data : []));
          setTopRated(mapTV(topRatedRes.success ? topRatedRes.data : []));
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch TV sections:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTVData();

    return () => {
      isMounted = false;
    };
  }, [language]);

  if (isLoading) {
    return <TVSeriesSectionsSkeleton language={language} />;
  }

  if (onTheAir.length === 0 && popular.length === 0 && topRated.length === 0) {
    return null;
  }

  return (
    <TVSeriesSections
      onTheAirTVSeries={onTheAir}
      popularTVSeries={popular}
      topRatedTVSeries={topRated}
      language={language}
    />
  );
}
