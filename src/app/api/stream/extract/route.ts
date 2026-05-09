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

// Decode javascript-obfuscator string table (custom base64: lowercase first, then uppercase)
function decodeObfuscatorTable(encoded: string): string {
  const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
  let raw = "";
  let buf = 0, bits = 0;
  for (const ch of encoded) {
    const v = alpha.indexOf(ch);
    if (v < 0 || v === 64) continue;
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      raw += String.fromCharCode((buf >> bits) & 0xff);
      buf &= (1 << bits) - 1;
    }
  }
  let pct = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    pct += "%" + (c < 16 ? "0" : "") + c.toString(16);
  }
  try { return decodeURIComponent(pct); } catch { return raw; }
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

function searchDomains(text: string, label: string): void {
  const domains = ["neonhorizon", "tmstr", ".m3u8"];
  for (const d of domains) {
    const idx = text.indexOf(d);
    if (idx >= 0) {
      console.log(`${TAG} *** '${d}' in ${label} at ${idx}: ...${text.slice(Math.max(0, idx - 40), idx + 200)}...`);
    }
  }
}

async function tryProrcp(proToken: string, referer: string): Promise<string | null> {
  const url = `https://cloudnestra.com/prorcp/${proToken}`;
  console.log(`${TAG} fetching prorcp: ${url.slice(0, 100)}`);
  const { text, status } = await fetchText(url, referer);
  if (status !== 200) { console.log(`${TAG} prorcp → ${status}`); return null; }
  console.log(`${TAG} prorcp HTML size: ${text.length}`);

  // 1. Direct m3u8 search in full HTML
  const m3u8 = findM3u8(text);
  if (m3u8) return m3u8;

  // 2. Search for streaming domains anywhere in the full HTML
  searchDomains(text, "prorcp HTML");

  // 3. Log body content after CSS (chars 2000-8000) to see inline scripts
  console.log(`${TAG} prorcp HTML [2000-8000]:\n${text.slice(2000, 8000)}`);

  // 4. Check external scripts
  const allScriptSrcs = [...text.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const skipPatterns = ["jquery", "cloudflare", "font-awesome", "unpkg.com", "googleapis"];
  const scriptSrcs = allScriptSrcs.filter((s) => !skipPatterns.some((p) => s.includes(p)));
  const prioritized = [
    ...scriptSrcs.filter((s) => /\/[a-f0-9]{20,}\.js|\/[a-zA-Z0-9]{8,}\/[a-f0-9]{20,}\.js/.test(s)),
    ...scriptSrcs.filter((s) => !/\/[a-f0-9]{20,}\.js|\/[a-zA-Z0-9]{8,}\/[a-f0-9]{20,}\.js/.test(s)),
  ];
  console.log(`${TAG} scripts:`, prioritized);

  for (const src of prioritized) {
    const scriptUrl = src.startsWith("http") ? src : `https://cloudnestra.com${src}`;
    const { text: js, status: s } = await fetchText(scriptUrl, url);
    if (s !== 200) continue;

    const m3u8b = findM3u8(js);
    if (m3u8b) return m3u8b;

    // Search for streaming domains in raw script text
    searchDomains(js, src);

    // Try to decode javascript-obfuscator string table
    const wMatch = js.match(/window\[['"][^'"]{5,50}['"]\]\s*=\s*'([A-Za-z0-9+/=]{100,})'/);
    if (wMatch) {
      console.log(`${TAG} Found obfuscator table in ${src}, decoding...`);
      const decoded = decodeObfuscatorTable(wMatch[1]);
      console.log(`${TAG} decoded table length: ${decoded.length}, sample[0:200]: ${decoded.slice(0, 200)}`);
      const m3u8c = findM3u8(decoded);
      if (m3u8c) { console.log(`${TAG} m3u8 found in decoded table!`); return m3u8c; }
      searchDomains(decoded, `decoded table from ${src}`);
    }

    const isPriority = /\/[a-f0-9]{20,}\.js|\/[a-zA-Z0-9]{8,}\/[a-f0-9]{20,}\.js/.test(src);
    if (!isPriority && js.length < 5000) {
      console.log(`${TAG} FULL script ${src}:\n${js}`);
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

  const directM3u8 = findM3u8(text);
  if (directM3u8) { console.log(`${TAG} m3u8 in rcp page`); return directM3u8; }

  const proToken = extractProrcpToken(text);
  if (!proToken) {
    console.log(`${TAG} No prorcp token in rcp page. HTML snippet:\n${text.slice(0, 3000)}`);
    return null;
  }

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
    const embedUrl =
      type === "tv"
        ? `${BASE}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `${BASE}/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    const { text: embedHtml, status } = await fetchText(embedUrl);
    if (status !== 200) throw new Error(`vidsrc embed HTTP ${status}`);

    const hashes = [...embedHtml.matchAll(/data-hash=["']([A-Za-z0-9+/=_\-]{10,})["']/g)]
      .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
    console.log(`${TAG} data-hash count: ${hashes.length}`);

    if (hashes.length === 0) {
      console.log(`${TAG} No hashes. HTML tail:\n${embedHtml.slice(-2000)}`);
      return NextResponse.json({ error: "no data-hash found" }, { status: 404 });
    }

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
