"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import Skeleton from "@/components/ui/Skeleton";
import { ChevronRight } from "lucide-react";

interface TVSeriesLoaderProps {
  language: string;
}

// 1. Wide Cover Rail Skeleton
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`wide-skeleton-${i}`} className="home-wide-cover-card select-none">
              <div className="home-wide-cover-card__cover relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-800/60">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="home-wide-cover-card__body mt-3 flex gap-3">
                <div className="relative size-12 sm:size-16 rounded overflow-hidden flex-shrink-0 bg-gray-800/80">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="home-wide-cover-card__info space-y-2 flex-grow">
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

// 2. Feature Slider Skeleton
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
      <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden bg-gray-800/60 select-none">
        <Skeleton className="absolute inset-0" />
        <div className="absolute bottom-6 left-6 space-y-3 z-10 w-2/3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-4">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`top-ten-tv-skeleton-${i}`} className="home-top-ten-card select-none">
              <div className="home-top-ten-card__thumb relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/60">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="home-top-ten-card__info mt-3 flex items-center gap-3">
                <Skeleton className="h-10 w-8 rounded" />
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
  const isEn = language === "en";
  const titles = {
    onTheAir: isEn ? "On The Air" : "Đang Phát Sóng",
    popular: isEn ? "Popular TV Series" : "Phim Bộ Phổ Biến",
    topRated: isEn ? "Top 10 Top Rated TV Series" : "Top 10 Phim Bộ Điểm Cao",
  };

  return (
    <div className="space-y-8">
      <div className="py-8">
        <WideCoverSkeletonList title={titles.onTheAir} />
      </div>
      <div className="py-8">
        <FeatureSliderSkeleton title={titles.popular} />
      </div>
      <div className="py-8">
        <TopTenTVSkeleton title={titles.topRated} />
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
