import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import type { MovieCardData } from "@/types/content.types";
import { getHomePageUiMessages } from "@/lib/ui-messages";

interface TVSeriesSectionsProps {
  onTheAirTVSeries: MovieCardData[];
  popularTVSeries: MovieCardData[];
  topRatedTVSeries: MovieCardData[];
  language: string;
}

export default function TVSeriesSections({
  onTheAirTVSeries,
  popularTVSeries,
  topRatedTVSeries,
  language,
}: TVSeriesSectionsProps) {
  const labels = getHomePageUiMessages(language);

  return (
    <div className="space-y-8">
      {/* On The Air Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={labels.onTheAir}
            href="/tv/on-the-air"
            viewMoreLabel={labels.viewMore}
          />
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
          <SectionHeader
            title={labels.popularTVSeries}
            href="/tv/popular"
            viewMoreLabel={labels.viewMore}
          />
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
          <SectionHeader
            title={labels.topRatedTVSeries}
            href="/tv/top-rated"
            viewMoreLabel={labels.viewMore}
          />
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
