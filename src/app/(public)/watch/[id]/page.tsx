import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchPageClient from "@/components/pages/WatchPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getWatchPageDataByRouteId } from "@/lib/detail-page-data";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

type SearchParamsValue = string | string[] | undefined;

interface WatchPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams?:
    | Promise<Record<string, SearchParamsValue>>
    | Record<string, SearchParamsValue>;
}

const getFirstParam = (value: SearchParamsValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const parsePositiveInt = (value: SearchParamsValue, fallback: number): number => {
  const raw = getFirstParam(value);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  return fallback;
};

export async function generateMetadata({
  params,
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : { id: "" };
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const movieId = resolvedParams.id;
  const season = parsePositiveInt(resolvedSearchParams?.season, 1);
  const episode = parsePositiveInt(resolvedSearchParams?.episode, 1);
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  if (!movieId) {
    return resolvePageMetadata({
      path: "/watch/[id]",
      language,
      fallback: seo.watchFallback,
    });
  }

  const initialData = await getWatchPageDataByRouteId(
    movieId,
    language,
    season,
    episode
  );

  if (!initialData.movieData) {
    return resolvePageMetadata({
      path: `/watch/${movieId}`,
      lookupPaths: ["/watch/[id]"],
      language,
      fallback: seo.watchFallback,
    });
  }

  const suffix =
    initialData.movieData.contentType === "tv"
      ? ` - S${season}E${episode}`
      : "";

  return resolvePageMetadata({
    path: `/watch/${movieId}`,
    lookupPaths: ["/watch/[id]"],
    language,
    fallback: {
      title: `${initialData.movieData.title}${suffix}`,
      description: initialData.movieData.description || seo.watchFallback.description,
    },
  });
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const movieId = resolvedParams.id;

  if (!movieId) {
    notFound();
  }

  const season = parsePositiveInt(resolvedSearchParams?.season, 1);
  const episode = parsePositiveInt(resolvedSearchParams?.episode, 1);
  const language = await getServerPreferredLanguage();

  const initialData = await getWatchPageDataByRouteId(
    movieId,
    language,
    season,
    episode
  );

  if (!initialData.movieData && !initialData.error) {
    notFound();
  }

  return (
    <WatchPageClient
      movieId={movieId}
      initialLanguage={language}
      initialMovieData={initialData.movieData}
      initialCredits={initialData.credits}
      initialRecommendations={initialData.recommendations}
      initialStreamCandidates={initialData.streamCandidates}
      initialStreamError={initialData.streamError}
      initialError={initialData.error}
      initialSeason={season}
      initialEpisode={episode}
    />
  );
}
