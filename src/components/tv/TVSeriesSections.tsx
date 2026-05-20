import HomeFeatureSlider from "@/components/movie/HomeFeatureSlider";
import HomeTopTenRail from "@/components/movie/HomeTopTenRail";
import HomeWideCoverRail from "@/components/movie/HomeWideCoverRail";
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
        <HomeWideCoverRail
          title={labels.onTheAir}
          href="/tv/on-the-air"
          viewMoreLabel={labels.viewMore}
          movies={onTheAirTVSeries}
        />
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
