import { NextRequest, NextResponse } from "next/server";

const TAG = "[stream/extract]";
const BASE = "https://vidsrcme.ru";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
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
    if (m?.[1]) {
      console.log(`${TAG} m3u8 found: ${m[1]}`);
      return m[1];
    }
  }
  return null;
}

function findCloudnestraUrl(text: string): string | null {
  const m = text.match(/(https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/);
  if (m?.[1]) {
    console.log(`${TAG} cloudnestra URL: ${m[1]}`);
    return m[1];
  }
  return null;
}

// Dump all interesting patterns from a JS file
function analyzeJs(label: string, js: string): void {
  console.log(`\n${TAG} ─── analyze: ${label} (${js.length} chars) ───`);

  // All string literals that look like URLs or paths
  const paths = [...js.matchAll(/["'`](\/[a-z][^"'`\s]{2,80})["'`]/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} path strings (${paths.length}):`);
  paths.slice(0, 30).forEach((p) => console.log(`${TAG}   ${p}`));

  // Full http/https URLs
  const urls = [...js.matchAll(/(https?:\/\/[^"'`\s\\]{5,120})/g)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} http URLs (${urls.length}):`);
  urls.slice(0, 20).forEach((u) => console.log(`${TAG}   ${u}`));

  // XMLHttpRequest open() calls
  const xhr = [...js.matchAll(/\.open\(["'`][^"'`]*["'`]\s*,\s*["'`]([^"'`\s]+)["'`]/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} XHR.open() URLs (${xhr.length}):`);
  xhr.forEach((u) => console.log(`${TAG}   ${u}`));

  // fetch() calls
  const fetches = [...js.matchAll(/fetch\(["'`]([^"'`\s]+)["'`]/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} fetch() (${fetches.length}):`);
  fetches.forEach((u) => console.log(`${TAG}   ${u}`));

  // cloudnestra refs
  const cn = [...js.matchAll(/["'`]([^"'`]*cloudnestra[^"'`]*)["'`]/gi)]
    .map((m) => m[1]);
  console.log(`${TAG} cloudnestra refs (${cn.length}):`);
  cn.slice(0, 10).forEach((s) => console.log(`${TAG}   ${s}`));

  // rcp refs
  const rcp = [...js.matchAll(/["'`]([^"'`]*\/rcp\/[^"'`]*)["'`]/gi)]
    .map((m) => m[1]);
  console.log(`${TAG} /rcp/ refs (${rcp.length}):`);
  rcp.slice(0, 10).forEach((s) => console.log(`${TAG}   ${s}`));

  console.log(`${TAG} first 3000 chars:\n${js.slice(0, 3000)}`);
  console.log(`${TAG} ─── end analyze: ${label} ───\n`);
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
    // 1. Fetch embed page
    const embedUrl =
      type === "tv"
        ? `${BASE}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
        : `${BASE}/embed/movie?tmdb=${tmdbId}&autoplay=1`;

    const { text: embedHtml } = await fetchText(embedUrl);
    console.log(`${TAG} embed size: ${embedHtml.length}`);

    const imdbId = embedHtml.match(/data-i=["'](\d+)["']/)?.[1] ?? null;
    console.log(`${TAG} data-i = ${imdbId}`);

    // 2. Find sources.js URL in embed page
    const sourcesJsPath = embedHtml.match(/(\/[^\s"'<>]+sources[^\s"'<>]*\.js[^\s"'<>]*)/i)?.[1];
    console.log(`${TAG} sources.js path: ${sourcesJsPath ?? "NOT FOUND"}`);

    // 3. Fetch and analyze sources.js
    if (sourcesJsPath) {
      const sourcesUrl = sourcesJsPath.startsWith("http") ? sourcesJsPath : `${BASE}${sourcesJsPath}`;
      const { text: sourcesJs, status } = await fetchText(sourcesUrl, embedUrl);
      if (status === 200) {
        analyzeJs("sources.js", sourcesJs);

        // Try to find cloudnestra URL directly in sources.js
        const cn = findCloudnestraUrl(sourcesJs);
        if (cn) {
          const { text: cnHtml } = await fetchText(cn, embedUrl);
          const m3u8 = findM3u8(cnHtml);
          if (m3u8) {
            const base = m3u8.substring(0, m3u8.lastIndexOf("/") + 1);
            const proxy = `/api/stream/proxy?url=${encodeURIComponent(m3u8)}&base=${encodeURIComponent(base)}`;
            console.log(`${TAG} SUCCESS via sources.js → ${m3u8}`);
            return NextResponse.json({ m3u8: proxy, raw: m3u8 });
          }
        }

        // Try to find API endpoints from sources.js and call them
        const paths = [...sourcesJs.matchAll(/["'`](\/[a-z][^"'`\s]{2,60})["'`]/gi)]
          .map((m) => m[1])
          .filter((p) => p.includes("source") || p.includes("stream") || p.includes("rcp") || p.includes("media"));

        for (const path of paths.slice(0, 10)) {
          const apiUrl = `${BASE}${path}`.replace("{id}", imdbId ?? "")
            .replace("{s}", season).replace("{e}", episode);
          console.log(`${TAG} trying API path: ${apiUrl}`);
          try {
            const { text: apiText, status: apiStatus } = await fetchText(apiUrl, embedUrl);
            if (apiStatus === 200) {
              console.log(`${TAG} API response (${apiText.length} chars):\n${apiText.slice(0, 600)}`);
              const cn2 = findCloudnestraUrl(apiText);
              if (cn2) {
                const { text: cnHtml2 } = await fetchText(cn2, embedUrl);
                const m3u8 = findM3u8(cnHtml2);
                if (m3u8) {
                  const base = m3u8.substring(0, m3u8.lastIndexOf("/") + 1);
                  const proxy = `/api/stream/proxy?url=${encodeURIComponent(m3u8)}&base=${encodeURIComponent(base)}`;
                  console.log(`${TAG} SUCCESS via API → ${m3u8}`);
                  return NextResponse.json({ m3u8: proxy, raw: m3u8 });
                }
              }
            }
          } catch {
            // continue
          }
        }
      }
    }

    // 4. Fetch and analyze cloudnestra's asdf.js if referenced
    const asdfMatch = embedHtml.match(/((?:https?:)?\/\/cloudnestra\.com\/[^\s"'<>]+\.js[^\s"'<>]*)/i);
    if (asdfMatch) {
      const asdfUrl = asdfMatch[1].startsWith("//") ? `https:${asdfMatch[1]}` : asdfMatch[1];
      console.log(`${TAG} cloudnestra JS file: ${asdfUrl}`);
      const { text: asdfJs, status } = await fetchText(asdfUrl, embedUrl);
      if (status === 200) analyzeJs("cloudnestra-asdf.js", asdfJs);
    }

    // 5. Analyze the main embed JS bundle too (last resort)
    const mainJsPath = embedHtml.match(/src=["'](\/[^"']+\.js[^"']*)["']/i)?.[1];
    if (mainJsPath && mainJsPath !== sourcesJsPath) {
      const mainJsUrl = `${BASE}${mainJsPath}`;
      const { text: mainJs, status } = await fetchText(mainJsUrl, embedUrl);
      if (status === 200) analyzeJs("main-bundle.js", mainJs);
    }

    console.log(`${TAG} FAILED: all methods exhausted`);
    return NextResponse.json({ error: "could not extract stream" }, { status: 404 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${TAG} ERROR: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
