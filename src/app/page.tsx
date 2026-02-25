import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getHomePageData } from "@/lib/home-page-data";

export default async function Home() {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const viewMoreLabel = isVietnamese ? "Xem thêm" : "View More";

  const {
    heroMovies,
    nowPlayingMovies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    onTheAirTVSeries,
    popularTVSeries,
    topRatedTVSeries,
  } = await getHomePageData(language);

  return (
    <Layout>
      <HeroSection movies={heroMovies} isLoading={false} />

      {/* Now Playing Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={isVietnamese ? "Đang chiếu" : "Now Playing"}
            href="/movies/now-playing"
            viewMoreLabel={viewMoreLabel}
          />
          <MovieGrid
            movies={nowPlayingMovies}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Popular Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={isVietnamese ? "Phổ biến" : "Popular"}
            href="/movies/popular"
            viewMoreLabel={viewMoreLabel}
          />
          <MovieGrid
            movies={popularMovies}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={isVietnamese ? "Đánh giá cao" : "Top Rated"}
            href="/movies/top-rated"
            viewMoreLabel={viewMoreLabel}
          />
          <MovieGrid
            movies={topRatedMovies}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={isVietnamese ? "Sắp chiếu" : "Upcoming"}
            href="/movies/upcoming"
            viewMoreLabel={viewMoreLabel}
          />
          <MovieGrid
            movies={upcomingMovies}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* TV Series Sections */}
      <TVSeriesSections
        onTheAirTVSeries={onTheAirTVSeries}
        popularTVSeries={popularTVSeries}
        topRatedTVSeries={topRatedTVSeries}
        isVietnamese={isVietnamese}
      />
    </Layout>
  );
}
