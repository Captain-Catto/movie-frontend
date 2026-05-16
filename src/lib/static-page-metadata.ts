import type { Metadata } from "next";
import type { SeoEntry } from "@/lib/page-seo";

export function buildStaticPageMetadataExtras(
  page: "home" | "trending" | "movies" | "tv" | "people",
  path: string,
  seo: SeoEntry
): Metadata {
  const imageUrl = `/api/og?page=${page}&title=${encodeURIComponent(
    seo.title
  )}&description=${encodeURIComponent(seo.description)}`;

  return {
    openGraph: {
      type: "website",
      url: path,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [imageUrl],
    },
  };
}
