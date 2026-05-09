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

// Decode vidsrc data-hash → split at first ':' → [mediaHash, proToken]
// The proToken is the prorcp path used by cloudnestra
function decodeVidsrcHash(hash: string): { mediaHash: string; proToken: string } | null {
  try {
    const decoded = Buffer.from(hash, "base64").toString("utf-8");
    console.log(`${TAG} decoded hash (first 120): ${decoded.slice(0, 120)}`);
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return null;
    const mediaHash = decoded.slice(0, colonIdx);
    const proToken = decoded.slice(colonIdx + 1);
    console.log(`${TAG} mediaHash: ${mediaHash}`);
    console.log(`${TAG} proToken (first 80): ${proToken.slice(0, 80)}`);
    return { mediaHash, proToken };
  } catch {
    return null;
  }
}

function buildProxy(m3u8Url: string): string {
  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
  return `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(base)}`;
}

async function tryProrcp(proToken: string, referer: string): Promise<string | null> {
  const url = `https://cloudnestra.com/prorcp/${proToken}`;
  console.log(`${TAG} trying prorcp: ${url.slice(0, 100)}...`);
  const { text, status } = await fetchText(url, referer);
  if (status !== 200) { console.log(`${TAG} prorcp → ${status}`); return null; }
  console.log(`${TAG} prorcp HTML size: ${text.length}`);

  const m3u8 = findM3u8(text);
  if (m3u8) return m3u8;

  // Log full prorcp HTML for inspection
  console.log(`${TAG} FULL prorcp HTML:\n${text}`);

  // Also check external scripts loaded by prorcp
  const scriptSrcs = [...text.matchAll(/src=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((s) => !s.includes("jquery") && !s.includes("cloudflare") && !s.includes("font-awesome"));
  console.log(`${TAG} prorcp scripts:`, scriptSrcs);

  for (const src of scriptSrcs.slice(0, 5)) {
    const scriptUrl = src.startsWith("http") ? src : `https://cloudnestra.com${src}`;
    const { text: js, status: s } = await fetchText(scriptUrl, url);
    if (s === 200) {
      const m3u8b = findM3u8(js);
      if (m3u8b) return m3u8b;
      // Log interesting parts
      const urls = [...js.matchAll(/(https?:\/\/[^"'`\s]{10,})/g)].map((m) => m[1]);
      if (urls.length > 0) {
        console.log(`${TAG} URLs in ${src}:`, urls.slice(0, 10));
      }
    }
  }

  return null;
}

async function tryRcpWithFullLog(hash: string, embedUrl: string): Promise<string | null> {
  const url = `https://cloudnestra.com/rcp/${hash}`;
  const { text, status } = await fetchText(url, embedUrl);
  if (status !== 200) return null;
  console.log(`${TAG} rcp HTML (FULL ${text.length} chars):\n${text}`);
  return findM3u8(text);
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

    // 3. For each hash: decode → try prorcp directly (skip rcp page)
    for (const hash of hashes) {
      console.log(`\n${TAG} --- hash: ${hash.slice(0, 40)}...`);
      const decoded = decodeVidsrcHash(hash);

      if (decoded?.proToken) {
        const m3u8 = await tryProrcp(decoded.proToken, embedUrl);
        if (m3u8) {
          const proxy = buildProxy(m3u8);
          console.log(`${TAG} SUCCESS → ${m3u8}`);
          console.log("=".repeat(60) + "\n");
          return NextResponse.json({ m3u8: proxy, raw: m3u8 });
        }
      }

      // Fallback: fetch rcp page and log it fully (only first hash to avoid spam)
      if (hash === hashes[0]) {
        const m3u8 = await tryRcpWithFullLog(hash, embedUrl);
        if (m3u8) {
          const proxy = buildProxy(m3u8);
          console.log(`${TAG} SUCCESS via rcp → ${m3u8}`);
          return NextResponse.json({ m3u8: proxy, raw: m3u8 });
        }
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
