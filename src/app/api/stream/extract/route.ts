import { NextRequest, NextResponse } from "next/server";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
};

const TAG = "[stream/extract]";

async function fetchText(url: string, referer?: string): Promise<string> {
  console.log(`${TAG} fetch → ${url}`);
  const res = await fetch(url, {
    headers: {
      ...BROWSER_HEADERS,
      ...(referer ? { Referer: referer, Origin: new URL(referer).origin } : {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  console.log(`${TAG} response ${res.status} ${res.statusText} ← ${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  console.log(`${TAG} body size: ${text.length} chars`);
  return text;
}

async function fetchJson(url: string, referer?: string): Promise<unknown> {
  console.log(`${TAG} fetch JSON → ${url}`);
  const res = await fetch(url, {
    headers: {
      ...BROWSER_HEADERS,
      Accept: "application/json, */*",
      ...(referer ? { Referer: referer, Origin: new URL(referer).origin } : {}),
    },
    signal: AbortSignal.timeout(10000),
  });
  console.log(`${TAG} response ${res.status} ← ${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Extract data-i (IMDB ID), data-s, data-e from vidsrc body tag
function extractBodyDataAttrs(html: string): { imdbId: string | null; season: string; episode: string } {
  const imdbMatch = html.match(/data-i=["'](\d+)["']/);
  const seasonMatch = html.match(/data-s=["'](\d+)["']/);
  const episodeMatch = html.match(/data-e=["'](\d+)["']/);
  return {
    imdbId: imdbMatch?.[1] ?? null,
    season: seasonMatch?.[1] ?? "1",
    episode: episodeMatch?.[1] ?? "1",
  };
}

// Search JS bundle for API-like URL patterns
function findApiPatternsInJs(html: string): void {
  // Find all string literals containing /api/
  const apiUrls = [...html.matchAll(/["'`]([^"'`]*\/api\/[^"'`]{3,100})["'`]/g)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 30);

  console.log(`${TAG} /api/ patterns in JS (${apiUrls.length}):`);
  apiUrls.forEach((u) => console.log(`${TAG}   ${u}`));

  // Find strings containing "source"
  const sourceStrings = [...html.matchAll(/["'`]([^"'`]*source[^"'`]{0,60})["'`]/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 20);

  console.log(`${TAG} "source" strings in JS (${sourceStrings.length}):`);
  sourceStrings.forEach((s) => console.log(`${TAG}   ${s}`));

  // Find strings containing "rcp" or "cloudnestra"
  const rcpStrings = [...html.matchAll(/["'`]([^"'`]*(rcp|cloudnestra)[^"'`]{0,80})["'`]/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10);

  console.log(`${TAG} "rcp/cloudnestra" strings in JS (${rcpStrings.length}):`);
  rcpStrings.forEach((s) => console.log(`${TAG}   ${s}`));

  // Find fetch() call patterns
  const fetchPatterns = [...html.matchAll(/fetch\(["'`]([^"'`]+)["'`]/g)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 20);

  console.log(`${TAG} fetch() patterns (${fetchPatterns.length}):`);
  fetchPatterns.forEach((p) => console.log(`${TAG}   ${p}`));
}

// Try known vidsrc API endpoint patterns to get the source/embed URL
async function tryVidsrcApi(
  base: string,
  imdbId: string,
  season: string,
  episode: string
): Promise<string | null> {
  const tt = `tt${imdbId}`;
  const candidates = [
    // Common vidsrc.me API patterns
    `${base}/api/v2/media/${tt}?s=${season}&e=${episode}`,
    `${base}/api/v2/media/${tt}/sources`,
    `${base}/api/v2/media/${imdbId}/sources?s=${season}&e=${episode}`,
    `${base}/api/v2/media/${tt}`,
    `${base}/rcp/${tt}`,
  ];

  for (const url of candidates) {
    try {
      const data = await fetchJson(url, base);
      const json = data as Record<string, unknown>;
      console.log(`${TAG} API response from ${url}:`, JSON.stringify(json).slice(0, 300));

      // Look for iframe/embed/source URL in response
      const text = JSON.stringify(json);
      const cloudnestraMatch = text.match(
        /(https?:\\?\/\\?\/cloudnestra\.com\\?\/(?:pro)?rcp\\?\/[A-Za-z0-9+/=_\-]+)/
      );
      if (cloudnestraMatch) {
        const url = cloudnestraMatch[1].replace(/\\\/\g/, "/");
        console.log(`${TAG} cloudnestra URL from API: ${url}`);
        return url;
      }
    } catch (e) {
      console.log(`${TAG} API ${url} failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  return null;
}

function extractCloudnestraUrl(html: string): string | null {
  const patterns = [
    /src=["'](https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/,
    /(https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/,
  ];

  for (const pat of patterns) {
    const match = html.match(pat);
    if (match) {
      console.log(`${TAG} cloudnestra URL: ${match[1]}`);
      return match[1];
    }
  }

  console.log(`${TAG} cloudnestra URL: NOT FOUND in HTML`);
  return null;
}

function extractM3u8Url(html: string): string | null {
  const patterns = [
    /["'`](https?:\/\/[^"'`\s]+\.m3u8[^"'`\s]*?)["'`]/,
    /(https?:\/\/[^"'\s,}\]]+\.m3u8[^"'\s,}\]]*)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = match[1] || match[0];
      if (url.includes("master.m3u8")) {
        console.log(`${TAG} m3u8 (master): ${url}`);
        return url;
      }
    }
  }
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = match[1] || match[0];
      console.log(`${TAG} m3u8 (index/other): ${url}`);
      return url;
    }
  }

  console.log(`${TAG} m3u8 URL: NOT FOUND`);
  return null;
}

function buildProxyM3u8Url(m3u8Url: string, baseUrl: string): string {
  return `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(baseUrl)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") || "movie";
  const season = searchParams.get("season") || "1";
  const episode = searchParams.get("episode") || "1";

  console.log(`\n${"=".repeat(60)}`);
  console.log(`${TAG} START tmdbId=${tmdbId} type=${type} season=${season} episode=${episode}`);
  console.log("=".repeat(60));

  if (!tmdbId) {
    return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
  }

  try {
    const vidsrcBase = "https://vidsrcme.ru";
    const vidsrcUrl =
      type === "tv"
        ? `${vidsrcBase}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `${vidsrcBase}/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    console.log(`${TAG} [1] fetching vidsrc embed: ${vidsrcUrl}`);
    const vidsrcHtml = await fetchText(vidsrcUrl);

    // Extract data-i (IMDB ID) from body tag
    const { imdbId } = extractBodyDataAttrs(vidsrcHtml);
    console.log(`${TAG} data-i (IMDB ID): ${imdbId}`);

    // Try to find cloudnestra URL in the HTML first
    console.log(`${TAG} [2] searching for cloudnestra URL in HTML...`);
    let cloudnestraUrl = extractCloudnestraUrl(vidsrcHtml);

    // If not found, analyze JS patterns and try vidsrc API directly
    if (!cloudnestraUrl) {
      console.log(`${TAG} [3] analyzing JS bundle for API patterns...`);
      findApiPatternsInJs(vidsrcHtml);

      if (imdbId) {
        console.log(`${TAG} [4] trying vidsrc API endpoints with IMDB ID ${imdbId}...`);
        cloudnestraUrl = await tryVidsrcApi(vidsrcBase, imdbId, season, episode);
      }
    }

    if (!cloudnestraUrl) {
      console.log(`${TAG} FAILED: could not find cloudnestra URL via any method`);
      return NextResponse.json(
        { error: "cloudnestra URL not found" },
        { status: 404 }
      );
    }

    // Fetch cloudnestra page and extract m3u8
    console.log(`${TAG} [5] fetching cloudnestra: ${cloudnestraUrl}`);
    const cloudnestraHtml = await fetchText(cloudnestraUrl, vidsrcUrl);

    console.log(`${TAG} [6] searching for m3u8 in cloudnestra HTML...`);
    let m3u8Url = extractM3u8Url(cloudnestraHtml);

    if (!m3u8Url) {
      console.log(`${TAG} m3u8 not in rcp page, looking for prorcp link...`);
      const prorcp = extractCloudnestraUrl(cloudnestraHtml);
      if (prorcp && prorcp !== cloudnestraUrl) {
        console.log(`${TAG} [6b] fetching prorcp: ${prorcp}`);
        const proHtml = await fetchText(prorcp, cloudnestraUrl);
        m3u8Url = extractM3u8Url(proHtml);
      } else {
        // Log cloudnestra HTML snippet for debugging
        console.log(`${TAG} cloudnestra HTML snippet:\n${cloudnestraHtml.slice(0, 3000)}`);
      }
    }

    if (!m3u8Url) {
      console.log(`${TAG} FAILED: m3u8 not found`);
      return NextResponse.json({ error: "m3u8 URL not found" }, { status: 404 });
    }

    const m3u8Base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
    const proxiedUrl = buildProxyM3u8Url(m3u8Url, m3u8Base);

    console.log(`${TAG} SUCCESS`);
    console.log(`${TAG}   raw m3u8 : ${m3u8Url}`);
    console.log(`${TAG}   proxy    : ${proxiedUrl}`);
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({ m3u8: proxiedUrl, raw: m3u8Url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.log(`${TAG} ERROR: ${message}`);
    console.log("=".repeat(60) + "\n");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
