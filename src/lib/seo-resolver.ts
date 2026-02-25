import "server-only";

import type { Metadata } from "next";
import { resolveUiLocale } from "@/lib/ui-messages";

interface RawSeoRecord {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  ogTitle?: string;
  og_title?: string;
  ogDescription?: string;
  og_description?: string;
  ogImage?: string;
  og_image?: string;
  twitterTitle?: string;
  twitter_title?: string;
  twitterDescription?: string;
  twitter_description?: string;
  twitterImage?: string;
  twitter_image?: string;
  canonical?: string;
  canonicalUrl?: string;
  pageSlug?: string;
  page_slug?: string;
  isActive?: boolean;
  is_active?: boolean;
  noIndex?: boolean;
  no_index?: boolean;
  noFollow?: boolean;
  no_follow?: boolean;
}

interface SeoOverride {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

interface ResolvePageMetadataInput {
  path: string;
  lookupPaths?: string[];
  language: string | undefined;
  fallback: {
    title: string;
    description: string;
    keywords?: string[];
  };
  forceNoIndex?: boolean;
  extras?: Omit<Metadata, "title" | "description" | "keywords">;
}

const HREFLANG_QUERY_PARAM = "hl";

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : "http://localhost:8080/api";

const SEO_RESOLVE_ENDPOINT =
  process.env.NEXT_PUBLIC_SEO_RESOLVE_ENDPOINT || "/seo/resolve";

const appendLanguageQuery = (href: string, languageCode: "vi" | "en"): string => {
  try {
    const isAbsolute = /^https?:\/\//i.test(href);
    const url = new URL(href, "https://movie.lequangtridat.com");
    url.searchParams.set(HREFLANG_QUERY_PARAM, languageCode);

    if (isAbsolute) {
      return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}${HREFLANG_QUERY_PARAM}=${languageCode}`;
  }
};

const normalizePath = (path: string): string => {
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  if (prefixed.length > 1 && prefixed.endsWith("/")) {
    return prefixed.slice(0, -1);
  }
  return prefixed;
};

const parseKeywords = (value: string[] | string | undefined): string[] | undefined => {
  if (Array.isArray(value)) {
    const filtered = value.map((k) => k.trim()).filter(Boolean);
    return filtered.length > 0 ? filtered : undefined;
  }

  if (typeof value === "string") {
    const parsed = value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    return parsed.length > 0 ? parsed : undefined;
  }

  return undefined;
};

const toSeoOverride = (raw: RawSeoRecord): SeoOverride | null => {
  const isActive = raw.isActive ?? raw.is_active ?? true;
  if (isActive === false) return null;

  return {
    title: raw.title,
    description: raw.description,
    keywords: parseKeywords(raw.keywords),
    ogTitle: raw.ogTitle ?? raw.og_title,
    ogDescription: raw.ogDescription ?? raw.og_description,
    ogImage: raw.ogImage ?? raw.og_image,
    twitterTitle: raw.twitterTitle ?? raw.twitter_title,
    twitterDescription: raw.twitterDescription ?? raw.twitter_description,
    twitterImage: raw.twitterImage ?? raw.twitter_image,
    canonical:
      raw.canonical ?? raw.canonicalUrl ?? raw.pageSlug ?? raw.page_slug,
    noIndex: raw.noIndex ?? raw.no_index,
    noFollow: raw.noFollow ?? raw.no_follow,
  };
};

const extractRawSeoRecord = (payload: unknown): RawSeoRecord | null => {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const dataCandidate =
    (root.data as unknown) ??
    (root.seo as unknown) ??
    (root.metadata as unknown) ??
    payload;

  if (!dataCandidate || typeof dataCandidate !== "object") return null;

  const dataObject = dataCandidate as Record<string, unknown>;
  const nested =
    (dataObject.seo as unknown) ??
    (dataObject.metadata as unknown) ??
    (dataObject.data as unknown) ??
    dataCandidate;

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) return null;

  return nested as RawSeoRecord;
};

const fetchSeoOverride = async (
  path: string,
  language: string | undefined,
  lookupPaths?: string[]
): Promise<SeoOverride | null> => {
  const locale = resolveUiLocale(language);
  const candidatePaths = Array.from(
    new Set([path, ...(lookupPaths || [])].map(normalizePath))
  );

  for (const candidatePath of candidatePaths) {
    try {
      const url = new URL(`${DEFAULT_API_BASE}${SEO_RESOLVE_ENDPOINT}`);
      url.searchParams.set("path", candidatePath);
      url.searchParams.set("locale", locale);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 300,
          tags: [`seo:${candidatePath}:${locale}`, "seo:global"],
        },
      });

      if (!response.ok) continue;

      const json = (await response.json()) as unknown;
      const raw = extractRawSeoRecord(json);
      if (!raw) continue;

      const override = toSeoOverride(raw);
      if (override) return override;
    } catch {
      continue;
    }
  }

  return null;
};

const buildRobots = (
  override: SeoOverride | null,
  forceNoIndex: boolean | undefined,
  existingRobots: Metadata["robots"] | undefined
): Metadata["robots"] | undefined => {
  const noIndex = forceNoIndex || override?.noIndex === true;
  const noFollow = forceNoIndex || override?.noFollow === true;

  if (!noIndex && !noFollow && !existingRobots) return undefined;

  if (typeof existingRobots === "object" && existingRobots !== null) {
    return {
      ...existingRobots,
      index: !noIndex,
      follow: !noFollow,
    };
  }

  return {
    index: !noIndex,
    follow: !noFollow,
  };
};

export const resolvePageMetadata = async ({
  path,
  lookupPaths,
  language,
  fallback,
  forceNoIndex,
  extras,
}: ResolvePageMetadataInput): Promise<Metadata> => {
  const normalizedPath = normalizePath(path);
  const override = await fetchSeoOverride(normalizedPath, language, lookupPaths);

  const title = override?.title || fallback.title;
  const description = override?.description || fallback.description;
  const keywords = override?.keywords?.length ? override.keywords : fallback.keywords;

  const resolvedCanonical = override?.canonical || normalizedPath;
  const alternates = {
    ...(extras?.alternates || {}),
    canonical: resolvedCanonical,
    languages: {
      ...(extras?.alternates?.languages || {}),
      "vi-VN": appendLanguageQuery(resolvedCanonical, "vi"),
      "en-US": appendLanguageQuery(resolvedCanonical, "en"),
      "x-default": resolvedCanonical,
    },
  };

  const robots = buildRobots(override, forceNoIndex, extras?.robots);

  const openGraph =
    override?.ogTitle ||
    override?.ogDescription ||
    override?.ogImage ||
    (extras && "openGraph" in extras)
      ? {
          ...(extras?.openGraph || {}),
          title: override?.ogTitle || override?.title || String(title),
          description: override?.ogDescription || description,
          ...(override?.ogImage ? { images: [override.ogImage] } : {}),
          ...(override?.canonical ? { url: override.canonical } : {}),
        }
      : extras?.openGraph;

  const twitter =
    override?.twitterTitle ||
    override?.twitterDescription ||
    override?.twitterImage ||
    (extras && "twitter" in extras)
      ? {
          ...(extras?.twitter || {}),
          title:
            override?.twitterTitle ||
            override?.ogTitle ||
            override?.title ||
            String(title),
          description:
            override?.twitterDescription || override?.ogDescription || description,
          ...(override?.twitterImage ? { images: [override.twitterImage] } : {}),
        }
      : extras?.twitter;

  return {
    ...extras,
    title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(alternates ? { alternates } : {}),
    ...(robots ? { robots } : {}),
    ...(openGraph ? { openGraph } : {}),
    ...(twitter ? { twitter } : {}),
  };
};
