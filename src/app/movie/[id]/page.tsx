import { notFound } from "next/navigation";
import MovieDetailPageClient from "@/components/pages/MovieDetailPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getMovieDetailInitialByTmdbId } from "@/lib/detail-page-data";

interface MovieDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const movieId = resolvedParams.id;
  const parsedTmdbId = Number(movieId);

  if (!movieId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    notFound();
  }

  const language = await getServerPreferredLanguage();
  const { movieData, contentType, error } = await getMovieDetailInitialByTmdbId(
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
