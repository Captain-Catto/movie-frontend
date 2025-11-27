// People/Cast Types - Actor and crew member type definitions

import { CastMember, CrewMember } from './api';

// Person details
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

// Person credits
export interface PersonCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

// Paginated person credits
export interface PersonCreditsPaginated extends PersonCredits {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata: {
    fromCache: boolean;
    totalCastItems: number;
    totalCrewItems: number;
  };
}
