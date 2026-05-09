import { NextRequest, NextResponse } from "next/server";

const TAG = "[stream/extract]";
const BASE = "https://vidsrcme.ru";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

async function fetchText(url: string, referer?: string): Promise<{ text: string; status: number }> {
  console.log(`${TAG} GET ${url}`);
  const res = await fetch(url, {
    headers: {
      ...HEADERS,
      ...(referer ? { Referer: referer, Origin: new URL(referer).origin } : {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  console.log(`${TAG} → ${res.status}`);
  const text = await res.text();
  return { text, status: res.status };
}

// sources.js revealed: src = "//cloudnestra.com/rcp/" + $(this).data("hash")
// So data-hash attributes in the embed HTML are the cloudnestra rcp tokens
function extractDataHashes(html: string): string[] {
  const matches = [...html.matchAll(/data-hash=["']([A-Za-z0-9+/=_\-]{10,})["']/g)];
  const hashes = matches.map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} data-hash values found: ${hashes.length}`);
  hashes.forEach((h) => console.log(`${TAG}   ${h.slice(0, 60)}...`));
  return hashes;
}

function findM3u8(html: string): string | null {
  const patterns = [
    /["'`](https?:\/\/[^"'`\s]+master\.m3u8[^"'`\s]*?)["'`]/,
    /["'`](https?:\/\/[^"'`\s]+\.m3u8[^"'`\s]*?)["'`]/,
    /(https?:\/\/[^"'\s,}\]]+master\.m3u8)/,
    /(https?:\/\/[^"'\s,}\]]+\.m3u8)/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      console.log(`${TAG} m3u8: ${m[1]}`);
      return m[1];
    }
  }
  return null;
}

async function getM3u8FromCloudnestra(hash: string, referer: string): Promise<string | null> {
  const playerUrl = `https://cloudnestra.com/rcp/${hash}`;
  console.log(`${TAG} fetching cloudnestra: ${playerUrl}`);
  const { text: html, status } = await fetchText(playerUrl, referer);
  if (status !== 200) {
    console.log(`${TAG} cloudnestra returned ${status}`);
    return null;
  }
  console.log(`${TAG} cloudnestra HTML size: ${html.length}`);

  // Try direct m3u8 in rcp page
  const m3u8 = findM3u8(html);
  if (m3u8) return m3u8;

  // Look for nested prorcp link
  const proMatch = html.match(/(https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/);
  if (proMatch?.[1] && proMatch[1] !== playerUrl) {
    console.log(`${TAG} found prorcp link: ${proMatch[1]}`);
    const { text: proHtml, status: proStatus } = await fetchText(proMatch[1], playerUrl);
    if (proStatus === 200) {
      const m3u8b = findM3u8(proHtml);
      if (m3u8b) return m3u8b;
      console.log(`${TAG} prorcp HTML snippet:\n${proHtml.slice(0, 2000)}`);
    }
  }

  console.log(`${TAG} cloudnestra HTML snippet:\n${html.slice(0, 2000)}`);
  return null;
}

function buildProxy(m3u8Url: string): string {
  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
  return `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(base)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") || "movie";
  const season = searchParams.get("season") || "1";
  const episode = searchParams.get("episode") || "1";

  console.log(`\n${"=".repeat(60)}`);
  console.log(`${TAG} START tmdbId=${tmdbId} type=${type} s=${season} e=${episode}`);
  console.log("=".repeat(60));

  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  try {
    // 1. Fetch vidsrc embed page
    const embedUrl =
      type === "tv"
        ? `${BASE}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `${BASE}/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    const { text: embedHtml, status } = await fetchText(embedUrl);
    if (status !== 200) throw new Error(`vidsrc embed HTTP ${status}`);
    console.log(`${TAG} embed size: ${embedHtml.length}`);

    // 2. Extract data-hash from .source / .server elements
    // sources.js: src = "//cloudnestra.com/rcp/" + $(this).data("hash")
    const hashes = extractDataHashes(embedHtml);

    if (hashes.length === 0) {
      // Log a chunk of the HTML to see what's there
      console.log(`${TAG} No data-hash found. HTML around 'source'/'server':\n`);
      const idx = embedHtml.indexOf("source");
      if (idx > -1) console.log(embedHtml.slice(Math.max(0, idx - 200), idx + 500));
      console.log(`${TAG} full HTML last 3000 chars:\n${embedHtml.slice(-3000)}`);
      return NextResponse.json({ error: "no data-hash found in embed page" }, { status: 404 });
    }

    // 3. Try each hash until we get an m3u8
    for (const hash of hashes) {
      const m3u8Url = await getM3u8FromCloudnestra(hash, embedUrl);
      if (m3u8Url) {
        const proxy = buildProxy(m3u8Url);
        console.log(`${TAG} SUCCESS`);
        console.log(`${TAG}   raw m3u8 : ${m3u8Url}`);
        console.log(`${TAG}   proxy    : ${proxy}`);
        console.log("=".repeat(60) + "\n");
        return NextResponse.json({ m3u8: proxy, raw: m3u8Url });
      }
    }

    console.log(`${TAG} FAILED: tried ${hashes.length} hashes, no m3u8 found`);
    return NextResponse.json({ error: "m3u8 not found in cloudnestra" }, { status: 404 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${TAG} ERROR: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
