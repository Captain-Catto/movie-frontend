import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import PeopleGrid from "@/components/people/PeopleGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import type { CastMember } from "@/types/content.types";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";

export interface PersonData {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: "movie" | "tv";
    poster_path: string | null;
  }>;
  popularity: number;
}

interface PeoplePageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

const normalizeKnownFor = (
  knownFor: unknown
): Array<{
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
}> => {
  if (!Array.isArray(knownFor)) return [];

  return knownFor.map((item) => {
    const record =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : ({} as Record<string, unknown>);
    const mediaType = record.media_type === "tv" ? "tv" : "movie";

    return {
      id: typeof record.id === "number" ? record.id : 0,
      title: typeof record.title === "string" ? record.title : undefined,
      name: typeof record.name === "string" ? record.name : undefined,
      media_type: mediaType,
      poster_path:
        typeof record.poster_path === "string" ? record.poster_path : null,
    };
  });
};

const mapCastMemberToPerson = (person: CastMember): PersonData => {
  const record = person as Record<string, unknown>;

  return {
    id: person.id,
    name: person.name,
    profile_path: person.profile_path ?? null,
    known_for_department:
      typeof person.known_for_department === "string"
        ? person.known_for_department
        : "Artist",
    known_for: normalizeKnownFor(record.known_for),
    popularity: typeof person.popularity === "number" ? person.popularity : 0,
  };
};

const PeoplePage = async ({ searchParams }: PeoplePageProps) => {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);

  let people: PersonData[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const response = await apiService.getPopularPeople(currentPage);
    people = Array.isArray(response.results)
      ? response.results.map(mapCastMemberToPerson)
      : [];
    totalPages =
      typeof response.total_pages === "number" && response.total_pages > 0
        ? response.total_pages
        : 1;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load people.";
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Actors & Directors
            </h1>
            <p className="text-gray-400">
              Explore a whole world of actors and filmmakers
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <PeopleGrid people={people} loading={false} />

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <LinkPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/people"
              />
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default PeoplePage;
