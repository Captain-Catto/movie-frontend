import type {
  CastMember,
  CrewMember,
  MovieDetail,
  MovieCardData,
  TVDetail,
} from "@/types/content.types";
import type { TableFilterOptions } from "@/types/ui";
import type { WatchContentData } from "@/utils/watchContentMapper";

export type PageDataError = string | null;

export interface PageListDataResult<T> {
  items: T[];
  totalPages: number;
  error: PageDataError;
}

export interface HomePageData {
  heroMovies: MovieCardData[];
  nowPlayingMovies: MovieCardData[];
  popularMovies: MovieCardData[];
  topRatedMovies: MovieCardData[];
  upcomingMovies: MovieCardData[];
  onTheAirTVSeries: MovieCardData[];
  popularTVSeries: MovieCardData[];
  topRatedTVSeries: MovieCardData[];
}

export type BrowseFetchType = "movie" | "tv" | "trending";

export interface BrowsePageParams {
  currentPage: number;
  fetchType: BrowseFetchType;
  currentFilters: TableFilterOptions;
  paginationQuery: Record<string, string | undefined>;
}

export interface MovieDetailPageDataResult {
  movieData: MovieDetail | null;
  contentType: "movie" | "tv" | null;
  error: PageDataError;
}

export interface TVDetailPageDataResult {
  tvData: TVDetail | null;
  error: PageDataError;
}

export interface WatchPageCredits {
  cast: CastMember[];
  crew: unknown[];
  runtime?: number | string;
}

export interface WatchPageRecommendationItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface WatchPageDataResult {
  movieData: WatchContentData | null;
  credits: WatchPageCredits | null;
  recommendations: WatchPageRecommendationItem[];
  streamCandidates: string[];
  streamError: PageDataError;
  error: PageDataError;
}

export interface PersonDetailData {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonDetailPageDataResult {
  personData: PersonDetailData | null;
  castCredits: CastMember[];
  crewCredits: CrewMember[];
  error: PageDataError;
}
