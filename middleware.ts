import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_COOKIE_KEY = "preferred-language";
const LANGUAGE_HEADER_KEY = "x-preferred-language";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const normalizePreferredLanguage = (
  value: string | null | undefined
): "vi-VN" | "en-US" | null => {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("vi")) return "vi-VN";
  if (normalized.startsWith("en")) return "en-US";
  return null;
};

export function middleware(request: NextRequest) {
  const queryLanguage = normalizePreferredLanguage(
    request.nextUrl.searchParams.get("hl")
  );
  const cookieLanguage = normalizePreferredLanguage(
    request.cookies.get(LANGUAGE_COOKIE_KEY)?.value
  );
  const effectiveLanguage = queryLanguage || cookieLanguage;

  if (!effectiveLanguage) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LANGUAGE_HEADER_KEY, effectiveLanguage);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (queryLanguage && queryLanguage !== cookieLanguage) {
    response.cookies.set({
      name: LANGUAGE_COOKIE_KEY,
      value: queryLanguage,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
