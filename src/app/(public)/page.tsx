import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import HomeTopTenRail from "@/components/movie/HomeTopTenRail";
import HomeTopicRows from "@/components/movie/HomeTopicRows";
import LazySection from "@/components/ui/LazySection";
import UpcomingMoviesLoader, { UpcomingSkeleton } from "@/components/movie/UpcomingMoviesLoader";
import TVSeriesLoader, { TVSeriesSectionsSkeleton } from "@/components/tv/TVSeriesLoader";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getInitialHomePageData } from "@/lib/home-page-data";
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
  } = await getInitialHomePageData(language);

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

      {/* Upcoming Section (Lazy Loaded) */}
      <div className="py-8 deferred-content">
        <LazySection fallback={<UpcomingSkeleton title={labels.upcoming} />}>
          <UpcomingMoviesLoader
            title={labels.upcoming}
            viewMoreLabel={labels.viewMore}
            language={language}
          />
        </LazySection>
      </div>

      {/* TV Series Sections (Lazy Loaded) */}
      <div className="deferred-content">
        <LazySection fallback={<TVSeriesSectionsSkeleton language={language} />}>
          <TVSeriesLoader language={language} />
        </LazySection>
      </div>
    </Layout>
  );
}

