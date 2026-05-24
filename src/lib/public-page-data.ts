import type { MovieCardData, CastMember } from "@/types/content.types";
import type { PersonData, PersonKnownForItem } from "@/types/people.types";
import { apiService } from "@/services/api";
import {
  getMovieListData,
  getTVListData,
  getTrendingListData,
} from "@/lib/content-list-data";
import type { PageListDataResult } from "@/lib/page-data.types";
import {
  DEFAULT_BROWSE_PAGE_SIZE,
  DEFAULT_TV_PAGE_SIZE,
} from "@/constants/app.constants";

const asKnownForItemArray = (knownFor: unknown): PersonKnownForItem[] => {
  if (!Array.isArray(knownFor)) {
    return [];
  }

  return knownFor.map((item) => {
    const record =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    return {
      id: typeof record.id === "number" ? record.id : 0,
      title: typeof record.title === "string" ? record.title : undefined,
      name: typeof record.name === "string" ? record.name : undefined,
      media_type: record.media_type === "tv" ? "tv" : "movie",
      poster_path:
        typeof record.poster_path === "string" ? record.poster_path : null,
    };
  });
};

const mapCastMemberToPersonData = (person: CastMember): PersonData => {
  const record = person as Record<string, unknown>;

  return {
    id: person.id,
    name: person.name,
    profile_path: (record.profilePath as string | null) ?? person.profile_path ?? null,
    known_for_department:
      typeof (record.knownForDepartment ?? person.known_for_department) === "string"
        ? (record.knownForDepartment ?? person.known_for_department) as string
        : "Artist",
    known_for: asKnownForItemArray(record.knownFor ?? record.known_for),
    popularity: typeof person.popularity === "number" ? person.popularity : 0,
  };
};

export async function getMoviesPageData(
  currentPage: number,
  language: string
): Promise<PageListDataResult<MovieCardData>> {
  return getMovieListData({
    currentPage,
    limit: DEFAULT_BROWSE_PAGE_SIZE,
    language,
  });
}

export async function getTVPageData(
  currentPage: number,
  language: string,
  query?: string
): Promise<PageListDataResult<MovieCardData>> {
  if (query && query.trim().length >= 2) {
    try {
      const response = await apiService.searchTV(query.trim(), currentPage, DEFAULT_TV_PAGE_SIZE);
      const res = response as unknown as Record<string, unknown>;
      const inner = (res.data as Record<string, unknown>) ?? {};
      const rawItems = (Array.isArray(inner.data) ? inner.data : []) as Record<string, unknown>[];
      const pagination = (inner.pagination as Record<string, unknown>) ?? {};
      const items: MovieCardData[] = rawItems.map((item) => ({
        tmdbId: Number(item.tmdbId ?? item.id ?? 0),
        title: String(item.title ?? item.name ?? ""),
        poster: item.posterPath
          ? `https://image.tmdb.org/t/p/w342${item.posterPath}`
          : null,
        href: `/tv/${item.tmdbId ?? item.id}`,
        rating: Number(item.voteAverage ?? item.vote_average ?? 0),
        year: item.firstAirDate
          ? new Date(item.firstAirDate as string).getFullYear()
          : undefined,
        description: String(item.overview ?? ""),
        genreIds: Array.isArray(item.genreIds) ? (item.genreIds as number[]) : [],
      }));
      return {
        items,
        totalPages: Number(pagination.totalPages ?? 1),
        error: null,
      };
    } catch {
      return { items: [], totalPages: 1, error: "Search failed" };
    }
  }

  return getTVListData({
    currentPage,
    limit: DEFAULT_TV_PAGE_SIZE,
    language,
  });
}

export async function getTrendingPageData(
  currentPage: number,
  language: string
): Promise<PageListDataResult<MovieCardData>> {
  return getTrendingListData({
    currentPage,
    limit: DEFAULT_BROWSE_PAGE_SIZE,
    language,
  });
}

export async function getPeoplePageData(
  currentPage: number,
  searchQuery: string = ""
): Promise<PageListDataResult<PersonData>> {
  try {
    const normalizedQuery = searchQuery.trim();
    const response = normalizedQuery
      ? await apiService.searchPeople(
          normalizedQuery,
          currentPage,
          DEFAULT_BROWSE_PAGE_SIZE
        )
      : await apiService.getPopularPeople(
          currentPage,
          DEFAULT_BROWSE_PAGE_SIZE
        );
    const people = Array.isArray(response.results)
      ? response.results.map(mapCastMemberToPersonData)
      : [];
    const responseRecord = response as unknown as Record<string, unknown>;
    const totalPagesValue =
      typeof response.total_pages === "number"
        ? response.total_pages
        : typeof responseRecord.totalPages === "number"
        ? responseRecord.totalPages
        : 1;
    const totalPages = totalPagesValue > 0 ? totalPagesValue : 1;

    return {
      items: people,
      totalPages,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      totalPages: 1,
      error: error instanceof Error ? error.message : "Failed to load people.",
    };
  }
}
