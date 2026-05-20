import MovieGrid from "@/components/movie/MovieGrid";
import HomeFeatureSlider from "@/components/movie/HomeFeatureSlider";
import HomeTopTenRail from "@/components/movie/HomeTopTenRail";
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
        <HomeFeatureSlider
          title={labels.popularTVSeries}
          href="/tv/popular"
          viewMoreLabel={labels.viewMore}
          movies={popularTVSeries}
        />
      </div>

      {/* Top Rated TV Series Section */}
      <div className="py-8">
        <HomeTopTenRail
          title={`Top 10 ${labels.topRatedTVSeries}`}
          movies={topRatedTVSeries}
        />
      </div>
    </div>
  );
}
