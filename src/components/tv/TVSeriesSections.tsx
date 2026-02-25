"use client";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import { useTVSeriesSections } from "@/hooks/components/useTVSeriesSections";

export default function TVSeriesSections() {
  const {
    onTheAirRef,
    popularRef,
    topRatedRef,
    onTheAirTVSeries,
    popularTVSeries,
    topRatedTVSeries,
    loadingStates,
  } = useTVSeriesSections();

  return (
    <div className="space-y-8">
      {/* On The Air Section */}
      <div ref={onTheAirRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="On The Air" href="/tv/on-the-air" />
          <MovieGrid
            movies={onTheAirTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.onTheAir}
          />
        </div>
      </div>

      {/* Popular TV Series Section */}
      <div ref={popularRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular TV Series" href="/tv/popular" />
          <MovieGrid
            movies={popularTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.popular}
          />
        </div>
      </div>

      {/* Top Rated TV Series Section */}
      <div ref={topRatedRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated TV Series" href="/tv/top-rated" />
          <MovieGrid
            movies={topRatedTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.topRated}
          />
        </div>
      </div>
    </div>
  );
}
