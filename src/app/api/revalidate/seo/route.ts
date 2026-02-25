import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { resolveUiLocale } from "@/lib/ui-messages";

interface RevalidateSeoRequest {
  path?: string;
  locale?: string;
}

const normalizePath = (path: string): string => {
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  if (prefixed.length > 1 && prefixed.endsWith("/")) {
    return prefixed.slice(0, -1);
  }
  return prefixed;
};

const hasValidSecret = (request: NextRequest): boolean => {
  const expected = process.env.SEO_REVALIDATE_SECRET;
  if (!expected) return true;

  const provided =
    request.headers.get("x-seo-revalidate-secret") ||
    request.headers.get("x-revalidate-secret");

  return provided === expected;
};

export async function POST(request: NextRequest) {
  if (!hasValidSecret(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let body: RevalidateSeoRequest = {};

  try {
    body = (await request.json()) as RevalidateSeoRequest;
  } catch {
    body = {};
  }

  const locale = resolveUiLocale(body.locale);

  revalidateTag("seo:global");

  if (body.path && body.path.trim()) {
    const normalizedPath = normalizePath(body.path);

    revalidateTag(`seo:${normalizedPath}:${locale}`);
    revalidateTag(`seo:${normalizedPath}:vi`);
    revalidateTag(`seo:${normalizedPath}:en`);
  }

  return NextResponse.json({
    success: true,
    message: "SEO cache revalidated",
  });
}
