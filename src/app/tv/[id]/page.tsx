import { notFound } from "next/navigation";
import TVDetailPageClient from "@/components/pages/TVDetailPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getTVDetailPageDataByTmdbId } from "@/lib/detail-page-data";

interface TVDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const tvId = resolvedParams.id;
  const parsedTmdbId = Number(tvId);

  if (!tvId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    notFound();
  }

  const language = await getServerPreferredLanguage();
  const { tvData, error } = await getTVDetailPageDataByTmdbId(
    parsedTmdbId,
    language
  );

  if (!tvData && !error) {
    notFound();
  }

  return (
    <TVDetailPageClient
      tvIdParam={tvId}
      initialLanguage={language}
      initialTVData={tvData}
      initialError={error}
    />
  );
}
