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

function findM3u8(html: string): string | null {
  const patterns = [
    /["'`](https?:\/\/[^"'`\s]+master\.m3u8[^"'`\s]*?)["'`]/,
    /["'`](https?:\/\/[^"'`\s]+\.m3u8[^"'`\s]*?)["'`]/,
    /(https?:\/\/[^"'\s,}\]]+master\.m3u8)/,
    /(https?:\/\/[^"'\s,}\]]+\.m3u8)/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) { console.log(`${TAG} m3u8: ${m[1]}`); return m[1]; }
  }
  return null;
}

// Extract /prorcp/{token} path from rcp page inline script
function extractProrcpToken(html: string): string | null {
  const patterns = [
    /src:\s*['"]\/prorcp\/([^'"]+)['"]/,
    /['"]\/prorcp\/([^'"]{10,})['"]/,
    /prorcp\/([A-Za-z0-9+/=_\-]{10,})/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      console.log(`${TAG} prorcp token from rcp: ${m[1].slice(0, 60)}...`);
      return m[1];
    }
  }
  return null;
}

function buildProxy(m3u8Url: string): string {
  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
  return `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(base)}`;
}

async function tryProrcp(proToken: string, referer: string): Promise<string | null> {
  const url = `https://cloudnestra.com/prorcp/${proToken}`;
  console.log(`${TAG} fetching prorcp: ${url.slice(0, 100)}`);
  const { text, status } = await fetchText(url, referer);
  if (status !== 200) { console.log(`${TAG} prorcp → ${status}`); return null; }
  console.log(`${TAG} prorcp HTML size: ${text.length}`);

  const m3u8 = findM3u8(text);
  if (m3u8) return m3u8;

  console.log(`${TAG} No m3u8 in prorcp HTML, checking scripts...`);
  console.log(`${TAG} prorcp HTML (first 2000):\n${text.slice(0, 2000)}`);

  // Check external scripts
  const allScriptSrcs = [...text.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1]);
  // Prioritize unique/hash-named scripts (likely media config), then others, skip known CDN libs
  const skipPatterns = ["jquery", "cloudflare", "font-awesome", "unpkg.com", "googleapis"];
  const scriptSrcs = allScriptSrcs.filter((s) => !skipPatterns.some((p) => s.includes(p)));
  const prioritized = [
    ...scriptSrcs.filter((s) => /\/[a-f0-9]{20,}\.js|\/[a-zA-Z0-9]{8,}\/[a-f0-9]{20,}\.js/.test(s)),
    ...scriptSrcs.filter((s) => !/\/[a-f0-9]{20,}\.js|\/[a-zA-Z0-9]{8,}\/[a-f0-9]{20,}\.js/.test(s)),
  ];
  console.log(`${TAG} prorcp scripts (prioritized):`, prioritized);

  for (const src of prioritized) {
    const scriptUrl = src.startsWith("http") ? src : `https://cloudnestra.com${src}`;
    const { text: js, status: s } = await fetchText(scriptUrl, url);
    if (s === 200) {
      const m3u8b = findM3u8(js);
      if (m3u8b) return m3u8b;
      const urls = [...js.matchAll(/(https?:\/\/[^"'`\s]{20,})/g)].map((m) => m[1]);
      if (urls.length > 0) console.log(`${TAG} URLs in ${src}:`, urls.slice(0, 15));
      // Log short scripts fully for inspection
      if (js.length < 5000) console.log(`${TAG} FULL script ${src} (${js.length}b):\n${js}`);
    }
  }

  return null;
}

async function fetchRcpAndExtract(hash: string, embedUrl: string): Promise<string | null> {
  const rcpUrl = `https://cloudnestra.com/rcp/${hash}`;
  console.log(`${TAG} fetching rcp: ${rcpUrl}`);
  const { text, status } = await fetchText(rcpUrl, embedUrl);
  if (status !== 200) { console.log(`${TAG} rcp → ${status}`); return null; }
  console.log(`${TAG} rcp HTML size: ${text.length}`);

  // First try: find m3u8 directly in rcp page
  const directM3u8 = findM3u8(text);
  if (directM3u8) {
    console.log(`${TAG} m3u8 found directly in rcp page`);
    return directM3u8;
  }

  // Extract prorcp token from inline script
  const proToken = extractProrcpToken(text);
  if (!proToken) {
    console.log(`${TAG} No prorcp token in rcp page. HTML snippet:\n${text.slice(0, 3000)}`);
    return null;
  }

  // Fetch prorcp page with the rcp URL as referer
  return tryProrcp(proToken, rcpUrl);
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

    // 2. Extract data-hash values
    const hashes = [...embedHtml.matchAll(/data-hash=["']([A-Za-z0-9+/=_\-]{10,})["']/g)]
      .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
    console.log(`${TAG} data-hash count: ${hashes.length}`);

    if (hashes.length === 0) {
      console.log(`${TAG} No hashes. HTML tail:\n${embedHtml.slice(-2000)}`);
      return NextResponse.json({ error: "no data-hash found" }, { status: 404 });
    }

    // 3. For each hash: fetch rcp page → extract prorcp token → fetch prorcp → find m3u8
    for (const hash of hashes) {
      console.log(`\n${TAG} --- hash: ${hash.slice(0, 40)}...`);
      const m3u8 = await fetchRcpAndExtract(hash, embedUrl);
      if (m3u8) {
        const proxy = buildProxy(m3u8);
        console.log(`${TAG} SUCCESS → ${m3u8}`);
        console.log("=".repeat(60) + "\n");
        return NextResponse.json({ m3u8: proxy, raw: m3u8 });
      }
    }

    console.log(`${TAG} FAILED: tried ${hashes.length} hashes`);
    return NextResponse.json({ error: "m3u8 not found" }, { status: 404 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${TAG} ERROR: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
