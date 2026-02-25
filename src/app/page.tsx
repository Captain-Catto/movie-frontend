import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getHomePageData } from "@/lib/home-page-data";

export default async function Home() {
  const language = await getServerPreferredLanguage();

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
          <SectionHeader title="Now Playing" href="/movies/now-playing" />
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
          <SectionHeader title="Popular" href="/movies/popular" />
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
          <SectionHeader title="Top Rated" href="/movies/top-rated" />
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
          <SectionHeader title="Upcoming" href="/movies/upcoming" />
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
      />
    </Layout>
  );
}
