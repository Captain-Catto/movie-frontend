// People/Cast Types - Actor and crew member type definitions

import type { CastMember, CrewMember } from "./content.types";
import type { MetadataInfo, Pagination } from "./api";

export interface PersonDetails {
  id: number;
  tmdbId: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_path?: string;
  known_for_department?: string;
  popularity?: number;
  gender?: number;
  homepage?: string;
  imdb_id?: string;
}

export interface PersonCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface PersonCreditsPaginated extends PersonCredits {
  pagination: Pagination;
  metadata: MetadataInfo;
}

export interface PopularPeopleResponse {
  page: number;
  results: CastMember[];
  total_pages: number;
  total_results: number;
}
