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
  const res = await fetch(url, {
    headers: {
      ...HEADERS,
      ...(referer ? { Referer: referer, Origin: new URL(referer).origin } : {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  const text = await res.text();
  return { text, status: res.status };
}

function findM3u8(html: string): string | null {
  const patterns = [
    /(https?:\/\/[a-zA-Z0-9._\-]+\/pl\/[A-Za-z0-9_\-\.]+\/master\.m3u8)/,
    /["'`](https?:\/\/[^"'`\s]+master\.m3u8[^"'`\s]*?)["'`]/,
    /["'`](https?:\/\/[^"'`\s]+\.m3u8[^"'`\s]*?)["'`]/,
    /(https?:\/\/[^"'\s,}\]]+master\.m3u8)/,
    /(https?:\/\/[^"'\s,}\]]+\.m3u8)/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    const url = m?.[1] ?? m?.[0];
    if (url?.startsWith("http")) return url;
  }
  return null;
}

function extractProrcpToken(html: string): string | null {
  const patterns = [
    /src:\s*['"]\/prorcp\/([^'"]+)['"]/,
    /['"]\/prorcp\/([^'"]{10,})['"]/,
    /prorcp\/([A-Za-z0-9+/=_\-]{10,})/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function buildProxy(m3u8Url: string): string {
  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
  return `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(base)}`;
}

async function tryProrcp(proToken: string, referer: string): Promise<string | null> {
  const url = `https://cloudnestra.com/prorcp/${proToken}`;
  const { text, status } = await fetchText(url, referer);
  if (status !== 200) return null;

  const m3u8 = findM3u8(text);
  if (m3u8) return m3u8;

  // Extract /pl/PATH/master.m3u8 path and CDN hosts from test_doms
  const plMatch = text.match(/\/pl\/([A-Za-z0-9_\-\.]{100,})\/master\.m3u8/);
  if (plMatch) {
    const plPath = plMatch[1];
    const cdnHosts: string[] = [];
    const testDomsM = text.match(/test_doms\s*=\s*\[([\s\S]*?)\]/);
    if (testDomsM) {
      for (const m of testDomsM[1].matchAll(/["'](https?:\/\/[^"']+)["']/g)) {
        cdnHosts.push(m[1]);
      }
    }
    if (cdnHosts.length === 0) cdnHosts.push("https://tmstr1.neonhorizonworkshops.com");
    return `${cdnHosts[0]}/pl/${plPath}/master.m3u8`;
  }

  return null;
}

async function fetchRcpAndExtract(hash: string, embedUrl: string): Promise<string | null> {
  const rcpUrl = `https://cloudnestra.com/rcp/${hash}`;
  const { text, status } = await fetchText(rcpUrl, embedUrl);
  if (status !== 200) return null;

  // Turnstile challenge — can't solve server-side, skip
  if (text.includes("cf-turnstile") && !text.includes("prorcp")) return null;

  const directM3u8 = findM3u8(text);
  if (directM3u8) return directM3u8;

  const proToken = extractProrcpToken(text);
  if (!proToken) return null;

  return tryProrcp(proToken, rcpUrl);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") || "movie";
  const season = searchParams.get("season") || "1";
  const episode = searchParams.get("episode") || "1";

  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  try {
    const embedUrl =
      type === "tv"
        ? `${BASE}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `${BASE}/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    const { text: embedHtml, status } = await fetchText(embedUrl);
    if (status !== 200) throw new Error(`vidsrc embed HTTP ${status}`);

    const hashes = [...embedHtml.matchAll(/data-hash=["']([A-Za-z0-9+/=_\-]{10,})["']/g)]
      .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);

    if (hashes.length === 0) {
      return NextResponse.json({ error: "no data-hash found" }, { status: 404 });
    }

    for (const hash of hashes) {
      const m3u8 = await fetchRcpAndExtract(hash, embedUrl);
      if (m3u8) {
        const proxy = buildProxy(m3u8);
        return NextResponse.json({ m3u8: proxy, raw: m3u8 });
      }
    }

    return NextResponse.json({ error: "m3u8 not found" }, { status: 404 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
