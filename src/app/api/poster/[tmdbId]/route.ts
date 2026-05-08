import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API = process.env.INTERNAL_API_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;
  const type = request.nextUrl.searchParams.get("type") || "movie";

  try {
    const res = await fetch(
      `${INTERNAL_API}/api/people/poster/${tmdbId}?type=${type}`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { success: false, data: { posterPath: null } },
      { status: 502 }
    );
  }
}
