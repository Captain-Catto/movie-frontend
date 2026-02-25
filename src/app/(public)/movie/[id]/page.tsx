import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailPageClient from "@/components/pages/MovieDetailPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getMovieDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface MovieDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : { id: "" };
  const movieId = resolvedParams.id;
  const parsedTmdbId = Number(movieId);
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  if (!movieId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    return resolvePageMetadata({
      path: "/movie/[id]",
      language,
      fallback: seo.movieDetailFallback,
    });
  }

  const { movieData } = await getMovieDetailPageDataByTmdbId(parsedTmdbId, language);

  return resolvePageMetadata({
    path: `/movie/${parsedTmdbId}`,
    lookupPaths: ["/movie/[id]"],
    language,
    fallback: {
      title: movieData?.title || seo.movieDetailFallback.title,
      description: movieData?.description || seo.movieDetailFallback.description,
    },
  });
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const movieId = resolvedParams.id;
  const parsedTmdbId = Number(movieId);

  if (!movieId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    notFound();
  }

  const language = await getServerPreferredLanguage();
  const { movieData, contentType, error } = await getMovieDetailPageDataByTmdbId(
    parsedTmdbId,
    language
  );

  if (!movieData && !error) {
    notFound();
  }

  return (
    <MovieDetailPageClient
      movieId={movieId}
      initialLanguage={language}
      initialMovieData={movieData}
      initialContentType={contentType}
      initialError={error}
    />
  );
}
