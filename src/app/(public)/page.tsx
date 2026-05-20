import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import HomePosterRail from "@/components/movie/HomePosterRail";
import HomeTopTenRail from "@/components/movie/HomeTopTenRail";
import HomeTopicRows from "@/components/movie/HomeTopicRows";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getHomePageData } from "@/lib/home-page-data";
import { getHomePageUiMessages } from "@/lib/ui-messages";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";
import { buildStaticPageMetadataExtras } from "@/lib/static-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/",
    language,
    fallback: seo.home,
    extras: buildStaticPageMetadataExtras("home", "/", seo.home),
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

      <div className="deferred-content">
        <HomeTopicRows
          rows={[
            {
              title: labels.nowPlaying,
              href: "/movies/now-playing",
              viewMoreLabel: labels.viewMore,
              movies: nowPlayingMovies,
              accentClassName: "home-topic-title--pink",
            },
            {
              title: labels.popular,
              href: "/movies/popular",
              viewMoreLabel: labels.viewMore,
              movies: popularMovies,
              accentClassName: "home-topic-title--magenta",
            },
          ]}
        />
      </div>

      <div className="deferred-content">
        <HomeTopTenRail
          title={`Top 10 ${labels.topRated}`}
          movies={topRatedMovies}
        />
      </div>

      {/* Upcoming Section */}
      <div className="py-8 deferred-content">
        <HomePosterRail
          title={labels.upcoming}
          href="/movies/upcoming"
          viewMoreLabel={labels.viewMore}
          movies={upcomingMovies}
        />
      </div>

      {/* TV Series Sections */}
      <div className="deferred-content">
        <TVSeriesSections
          onTheAirTVSeries={onTheAirTVSeries}
          popularTVSeries={popularTVSeries}
          topRatedTVSeries={topRatedTVSeries}
          language={language}
        />
      </div>
    </Layout>
  );
}
