import { MetadataRoute } from "next";

const BASE_URL = "https://movie.lequangtridat.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours
const MAX_DETAIL_ITEMS_PER_TYPE = 120;

type UnknownRecord = Record<string, unknown>;

const toAbsoluteUrl = (path: string): string =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const staticEntries = (): MetadataRoute.Sitemap => [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: toAbsoluteUrl("/movies"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: toAbsoluteUrl("/tv"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: toAbsoluteUrl("/trending"),
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: toAbsoluteUrl("/browse"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/people"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: toAbsoluteUrl("/terms"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: toAbsoluteUrl("/privacy"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: toAbsoluteUrl("/faq"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: toAbsoluteUrl("/movies/now-playing"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/movies/popular"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/movies/top-rated"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/movies/upcoming"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/tv/on-the-air"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/tv/popular"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: toAbsoluteUrl("/tv/top-rated"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
];

const extractArray = (payload: unknown): UnknownRecord[] => {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is UnknownRecord =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item)
    );
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as UnknownRecord;
  const directData = root.data;
  const nestedData =
    directData && typeof directData === "object"
      ? (directData as UnknownRecord).data
      : undefined;
  const nestedResults =
    directData && typeof directData === "object"
      ? (directData as UnknownRecord).results
      : undefined;

  const candidates = [
    directData,
    nestedData,
    nestedResults,
    root.results,
    root.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is UnknownRecord =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item)
      );
    }
  }

  return [];
};

const getId = (record: UnknownRecord): number | null => {
  const candidates = [
    record.tmdbId,
    record.tmdb_id,
    record.id,
    record.contentId,
    record.content_id,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
};

const fetchList = async (endpoint: string): Promise<UnknownRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: SITEMAP_REVALIDATE_SECONDS,
        tags: ["sitemap:content"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const json = (await response.json()) as unknown;
    return extractArray(json);
  } catch {
    return [];
  }
};

const buildDetailEntries = (
  ids: number[],
  prefix: "/movie" | "/tv" | "/people"
): MetadataRoute.Sitemap =>
  ids.map((id) => ({
    url: toAbsoluteUrl(`${prefix}/${id}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

const uniqueIds = (records: UnknownRecord[]): number[] => {
  const deduplicated = new Set<number>();

  for (const record of records) {
    const id = getId(record);
    if (id) {
      deduplicated.add(id);
    }
    if (deduplicated.size >= MAX_DETAIL_ITEMS_PER_TYPE) {
      break;
    }
  }

  return Array.from(deduplicated);
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  const [moviesRaw, tvRaw, peopleRaw] = await Promise.all([
    fetchList("/movies/popular?page=1&limit=200"),
    fetchList("/tv/popular-tv?page=1&limit=200"),
    fetchList("/people/popular?page=1"),
  ]);

  const movieIds = uniqueIds(moviesRaw);
  const tvIds = uniqueIds(tvRaw);
  const peopleIds = uniqueIds(peopleRaw);

  return [
    ...base,
    ...buildDetailEntries(movieIds, "/movie"),
    ...buildDetailEntries(tvIds, "/tv"),
    ...buildDetailEntries(peopleIds, "/people"),
  ];
}
