import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "neonhorizonworkshops.com",
  "cloudnestra.com",
];

function isAllowedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname.endsWith(h));
  } catch {
    return false;
  }
}

function rewriteM3u8(content: string, m3u8Url: string, baseUrl: string): string {
  const origin = new URL(m3u8Url).origin;
  const lines = content.split("\n");

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      let absoluteUrl: string;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        absoluteUrl = trimmed;
      } else if (trimmed.startsWith("/")) {
        absoluteUrl = `${origin}${trimmed}`;
      } else {
        absoluteUrl = `${baseUrl}${trimmed}`;
      }

      return `/api/stream/proxy?url=${encodeURIComponent(absoluteUrl)}&base=${encodeURIComponent(baseUrl)}`;
    })
    .join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  const base = searchParams.get("base") || "";

  if (!url) {
    return new NextResponse("url required", { status: 400 });
  }

  if (!isAllowedHost(url)) {
    return new NextResponse("host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://cloudnestra.com/",
        Origin: "https://cloudnestra.com",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return new NextResponse(`upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") || "";
    const isM3u8 =
      url.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegURL");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (isM3u8) {
      const text = await upstream.text();
      const rewritten = rewriteM3u8(text, url, base || url.substring(0, url.lastIndexOf("/") + 1));
      return new NextResponse(rewritten, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Stream video segments directly
    return new NextResponse(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType || "video/MP2T",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "proxy error";
    return new NextResponse(message, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
