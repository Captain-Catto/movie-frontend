import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getHomePageData } from "@/lib/home-page-data";
import { getHomePageUiMessages } from "@/lib/ui-messages";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/",
    language,
    fallback: seo.home,
  });
}

export default async function Home() {
  const language = await getServerPreferredLanguage();
  const labels = getHomePageUiMessages(language);

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
            title={labels.nowPlaying}
            href="/movies/now-playing"
            viewMoreLabel={labels.viewMore}
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
            title={labels.popular}
            href="/movies/popular"
            viewMoreLabel={labels.viewMore}
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
            title={labels.topRated}
            href="/movies/top-rated"
            viewMoreLabel={labels.viewMore}
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
            title={labels.upcoming}
            href="/movies/upcoming"
            viewMoreLabel={labels.viewMore}
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
        language={language}
      />
    </Layout>
  );
}
