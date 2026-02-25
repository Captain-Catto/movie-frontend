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
    profile_path: person.profile_path ?? null,
    known_for_department:
      typeof person.known_for_department === "string"
        ? person.known_for_department
        : "Artist",
    known_for: asKnownForItemArray(record.known_for),
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
  language: string
): Promise<PageListDataResult<MovieCardData>> {
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
  currentPage: number
): Promise<PageListDataResult<PersonData>> {
  try {
    const response = await apiService.getPopularPeople(currentPage);
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
