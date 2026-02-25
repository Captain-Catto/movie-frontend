import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import type { MovieCardData } from "@/types/content.types";

interface TVSeriesSectionsProps {
  onTheAirTVSeries: MovieCardData[];
  popularTVSeries: MovieCardData[];
  topRatedTVSeries: MovieCardData[];
}

export default function TVSeriesSections({
  onTheAirTVSeries,
  popularTVSeries,
  topRatedTVSeries,
}: TVSeriesSectionsProps) {
  return (
    <div className="space-y-8">
      {/* On The Air Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="On The Air" href="/tv/on-the-air" />
          <MovieGrid
            movies={onTheAirTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Popular TV Series Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular TV Series" href="/tv/popular" />
          <MovieGrid
            movies={popularTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Top Rated TV Series Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated TV Series" href="/tv/top-rated" />
          <MovieGrid
            movies={topRatedTVSeries}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>
    </div>
  );
}
