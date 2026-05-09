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

function extractCloudnestraUrl(html: string): string | null {
  // iframe src pattern
  const iframeMatch = html.match(
    /src=["'](https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/
  );
  if (iframeMatch) {
    console.log(`${TAG} cloudnestra URL (iframe): ${iframeMatch[1]}`);
    return iframeMatch[1];
  }

  // JS string pattern
  const jsMatch = html.match(
    /(https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/
  );
  if (jsMatch) {
    console.log(`${TAG} cloudnestra URL (js): ${jsMatch[1]}`);
    return jsMatch[1];
  }

  console.log(`${TAG} cloudnestra URL: NOT FOUND`);
  console.log(`${TAG} html snippet (first 2000 chars):\n${html.slice(0, 2000)}`);
  return null;
}

function extractM3u8Url(html: string): string | null {
  const patterns = [
    /["'`](https?:\/\/[^"'`\s]+\.m3u8[^"'`\s]*?)["'`]/,
    /(https?:\/\/[^"'\s,}\]]+\.m3u8[^"'\s,}\]]*)/,
  ];

  // First pass: prefer master.m3u8
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

  // Second pass: accept any .m3u8
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = match[1] || match[0];
      console.log(`${TAG} m3u8 (index/other): ${url}`);
      return url;
    }
  }

  console.log(`${TAG} m3u8 URL: NOT FOUND`);
  console.log(`${TAG} html snippet (first 3000 chars):\n${html.slice(0, 3000)}`);
  return null;
}

function buildProxyM3u8Url(m3u8Url: string, baseUrl: string): string {
  const encoded = encodeURIComponent(m3u8Url);
  const encodedBase = encodeURIComponent(baseUrl);
  return `/api/stream/proxy?url=${encoded}&base=${encodedBase}`;
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
    // Step 1: Build vidsrc embed URL
    const vidsrcUrl =
      type === "tv"
        ? `https://vidsrcme.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `https://vidsrcme.ru/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    console.log(`${TAG} [1/5] vidsrc URL: ${vidsrcUrl}`);

    // Step 2: Fetch vidsrc embed page
    const vidsrcHtml = await fetchText(vidsrcUrl);

    // Step 3: Extract cloudnestra URL
    console.log(`${TAG} [2/5] extracting cloudnestra URL from vidsrc HTML...`);
    const cloudnestraUrl = extractCloudnestraUrl(vidsrcHtml);
    if (!cloudnestraUrl) {
      console.log(`${TAG} FAILED: cloudnestra URL not found`);
      return NextResponse.json(
        { error: "cloudnestra URL not found in vidsrc page" },
        { status: 404 }
      );
    }

    // Step 4: Fetch cloudnestra player page
    console.log(`${TAG} [3/5] fetching cloudnestra page...`);
    const cloudnestraHtml = await fetchText(cloudnestraUrl, vidsrcUrl);

    // Step 5: Extract m3u8 URL from cloudnestra page
    console.log(`${TAG} [4/5] extracting m3u8 from cloudnestra HTML...`);
    let m3u8Url = extractM3u8Url(cloudnestraHtml);

    // Step 5b: If not found, look for prorcp URL inside cloudnestra and try that
    if (!m3u8Url) {
      console.log(`${TAG} m3u8 not in rcp page, checking for prorcp URL...`);
      const prorcp = extractCloudnestraUrl(cloudnestraHtml);
      if (prorcp && prorcp !== cloudnestraUrl) {
        console.log(`${TAG} [4b/5] fetching prorcp page: ${prorcp}`);
        const proHtml = await fetchText(prorcp, cloudnestraUrl);
        m3u8Url = extractM3u8Url(proHtml);
      } else {
        console.log(`${TAG} no prorcp URL found either`);
      }
    }

    if (!m3u8Url) {
      console.log(`${TAG} FAILED: m3u8 not found anywhere`);
      return NextResponse.json(
        { error: "m3u8 URL not found in cloudnestra page" },
        { status: 404 }
      );
    }

    // Step 6: Build proxy URL
    console.log(`${TAG} [5/5] building proxy URL...`);
    const m3u8Base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
    const proxiedUrl = buildProxyM3u8Url(m3u8Url, m3u8Base);

    console.log(`${TAG} SUCCESS`);
    console.log(`${TAG}   raw m3u8 : ${m3u8Url}`);
    console.log(`${TAG}   proxy url: ${proxiedUrl}`);
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({ m3u8: proxiedUrl, raw: m3u8Url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.log(`${TAG} ERROR: ${message}`);
    console.log("=".repeat(60) + "\n");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
