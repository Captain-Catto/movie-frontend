import {
  FALLBACK_POSTER,
  FALLBACK_PROFILE,
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
} from "@/constants/app.constants";
import { apiService } from "@/services/api";
import type {
  CastMember,
  CrewMember,
  MovieCardData,
} from "@/types/content.types";
import type {
  PersonDetailData,
  PersonDetailPageDataResult,
} from "@/lib/page-data.types";
import type { PersonDetails } from "@/types/people.types";

const createCrewGroupKey = (crew: CrewMember): string => {
  const mediaType = crew.media_type === "tv" ? "tv" : "movie";
  const contentTitle = crew.title || crew.original_title || "";
  return `${mediaType}:${crew.id}:${contentTitle}`;
};

const mergeCrewJobs = (existingJob?: string, nextJob?: string): string | undefined => {
  const jobSet = new Set<string>();
  if (existingJob) {
    existingJob
      .split(",")
      .map((job) => job.trim())
      .filter(Boolean)
      .forEach((job) => jobSet.add(job));
  }
  if (nextJob) {
    nextJob
      .split(",")
      .map((job) => job.trim())
      .filter(Boolean)
      .forEach((job) => jobSet.add(job));
  }
  const combined = Array.from(jobSet);
  return combined.length > 0 ? combined.join(", ") : undefined;
};

function normalizePersonDetails(person: PersonDetails): PersonDetailData {
  return {
    id: person.id,
    name: person.name,
    biography: person.biography ?? "No biography available",
    birthday: person.birthday ?? null,
    deathday: person.deathday ?? null,
    place_of_birth: person.place_of_birth ?? null,
    profile_path: person.profile_path ?? null,
    known_for_department:
      typeof person.known_for_department === "string"
        ? person.known_for_department
        : "Unknown",
    popularity: typeof person.popularity === "number" ? person.popularity : 0,
  };
}

export function groupCrewCreditsByContent(crewItems: CrewMember[]): CrewMember[] {
  const groupedCrew = crewItems.reduce<Record<string, CrewMember>>(
    (acc, item) => {
      const key = createCrewGroupKey(item);
      const existingItem = acc[key];

      if (existingItem) {
        acc[key] = {
          ...existingItem,
          job: mergeCrewJobs(existingItem.job, item.job),
        };
        return acc;
      }

      acc[key] = {
        ...item,
        media_type: item.media_type === "tv" ? "tv" : "movie",
      };
      return acc;
    },
    {}
  );

  return Object.values(groupedCrew);
}

export function mapPersonCreditToMovieCardData(
  item: CastMember | CrewMember
): MovieCardData {
  const posterPath = item.poster_path ?? item.profile_path ?? null;
  const mediaType = item.media_type === "tv" ? "tv" : "movie";
  const releaseDate = item.release_date ?? item.first_air_date ?? null;
  const character =
    "character" in item && typeof item.character === "string"
      ? item.character
      : undefined;
  const job = "job" in item && typeof item.job === "string" ? item.job : undefined;

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : NaN;

  return {
    id: item.id.toString(),
    tmdbId: item.id,
    title: item.title || item.name || "",
    aliasTitle: character || job || item.title || item.name || "",
    poster: posterPath
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`
      : FALLBACK_POSTER,
    href: mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`,
    year: Number.isFinite(releaseYear) ? releaseYear : undefined,
    rating: typeof item.vote_average === "number" ? item.vote_average : undefined,
  };
}

export function getPersonProfileImage(profilePath: string | null | undefined): string {
  if (profilePath) {
    return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${profilePath}`;
  }
  return FALLBACK_PROFILE;
}

export async function getPersonDetailPageDataById(
  personId: number
): Promise<PersonDetailPageDataResult> {
  try {
    const personDetails = await apiService.getPersonDetails(personId);
    const personData = normalizePersonDetails(personDetails);

    try {
      const creditsResponse = await apiService.getPersonCredits(personId);

      return {
        personData,
        castCredits: Array.isArray(creditsResponse.cast) ? creditsResponse.cast : [],
        crewCredits: groupCrewCreditsByContent(
          Array.isArray(creditsResponse.crew) ? creditsResponse.crew : []
        ),
        error: null,
      };
    } catch {
      return {
        personData,
        castCredits: [],
        crewCredits: [],
        error: "Unable to load filmography",
      };
    }
  } catch (error) {
    return {
      personData: null,
      castCredits: [],
      crewCredits: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load actor information",
    };
  }
}
