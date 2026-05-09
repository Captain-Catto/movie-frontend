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

function findCloudnestraUrl(text: string): string | null {
  const m = text.match(/(https?:\/\/cloudnestra\.com\/(?:pro)?rcp\/[A-Za-z0-9+/=_\-]+)/);
  if (m?.[1]) { console.log(`${TAG} cloudnestra URL: ${m[1]}`); return m[1]; }
  return null;
}

function analyzeJs(label: string, js: string): void {
  console.log(`\n${TAG} ─── ${label} (${js.length} chars) ───`);

  const paths = [...js.matchAll(/["'`](\/[a-zA-Z][^"'`\s]{2,80})["'`]/g)]
    .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} path strings (${paths.length}):`);
  paths.slice(0, 40).forEach((p) => console.log(`${TAG}   ${p}`));

  const urls = [...js.matchAll(/(https?:\/\/[^"'`\s\\]{5,120})/g)]
    .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} http URLs (${urls.length}):`);
  urls.slice(0, 20).forEach((u) => console.log(`${TAG}   ${u}`));

  const xhr = [...js.matchAll(/\.open\([^,]+,\s*["'`]([^"'`\s]+)["'`]/gi)]
    .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} XHR.open (${xhr.length}): ${xhr.join(", ")}`);

  const fetches = [...js.matchAll(/fetch\(["'`]([^"'`\s]+)["'`]/gi)]
    .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log(`${TAG} fetch() (${fetches.length}): ${fetches.join(", ")}`);

  const cn = [...js.matchAll(/["'`]([^"'`]*cloudnestra[^"'`]*)["'`]/gi)].map((m) => m[1]);
  console.log(`${TAG} cloudnestra refs (${cn.length}):`);
  cn.slice(0, 10).forEach((s) => console.log(`${TAG}   ${s}`));

  const rcp = [...js.matchAll(/["'`]([^"'`]*rcp[^"'`]{0,60})["'`]/gi)].map((m) => m[1]);
  console.log(`${TAG} rcp refs (${rcp.length}): ${rcp.slice(0, 5).join(" | ")}`);

  console.log(`${TAG} first 4000 chars:\n${js.slice(0, 4000)}`);
  console.log(`${TAG} ─── end ${label} ───\n`);
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
    const imdbId = embedHtml.match(/data-i=["'](\d+)["']/)?.[1] ?? null;
    console.log(`${TAG} data-i = ${imdbId}`);

    // 2. Extract the inline <script> content (the big webpack bundle)
    const inlineScript = embedHtml.match(/<script[^>]*>([\s\S]{1000,}?)<\/script>/)?.[1] ?? "";
    console.log(`${TAG} inline script size: ${inlineScript.length}`);

    // 3. Analyze the inline bundle to find clues
    if (inlineScript.length > 100) {
      analyzeJs("inline-bundle", inlineScript);
    }

    // 4. Find sources.js path INSIDE the inline bundle (not as src attribute)
    const sourcesJsPath =
      inlineScript.match(/["'`](\/[^"'`\s]*sources[^"'`\s]*\.js(?:\?[^"'`\s]*)?)["'`]/i)?.[1] ??
      embedHtml.match(/(\/sources\.js\?[^\s"'<>]*)/)?.[1] ??
      null;
    console.log(`${TAG} sources.js path in bundle: ${sourcesJsPath ?? "NOT FOUND"}`);

    if (sourcesJsPath) {
      const sourcesUrl = `${BASE}${sourcesJsPath}`;
      const { text: sourcesJs, status } = await fetchText(sourcesUrl, embedUrl);
      if (status === 200) {
        analyzeJs("sources.js", sourcesJs);

        const cn = findCloudnestraUrl(sourcesJs);
        if (cn) {
          const { text: cnHtml } = await fetchText(cn, embedUrl);
          const m3u8 = findM3u8(cnHtml);
          if (m3u8) return successResponse(m3u8);
        }

        // Try API paths found in sources.js
        const apiPaths = [...sourcesJs.matchAll(/["'`](\/[^"'`\s]*(?:source|stream|rcp|media)[^"'`\s]{0,60})["'`]/gi)]
          .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);

        for (const path of apiPaths.slice(0, 15)) {
          const apiUrl = `${BASE}${path}`
            .replace(/\{?id\}?/i, imdbId ?? "")
            .replace(/\{?s\}?/i, season)
            .replace(/\{?e\}?/i, episode);
          try {
            const { text: apiText, status: s } = await fetchText(apiUrl, embedUrl);
            if (s === 200) {
              console.log(`${TAG} API hit ${apiUrl}:\n${apiText.slice(0, 400)}`);
              const cn2 = findCloudnestraUrl(apiText);
              if (cn2) {
                const { text: cnHtml2 } = await fetchText(cn2, embedUrl);
                const m3u8 = findM3u8(cnHtml2);
                if (m3u8) return successResponse(m3u8);
              }
            }
          } catch { /* continue */ }
        }
      }
    }

    // 5. Also fetch all external <script src="..."> files from vidsrcme.ru
    const externalScripts = [...embedHtml.matchAll(/src=["']((?:https?:\/\/vidsrcme\.ru)?\/[^"']+\.js[^"']*)["']/gi)]
      .map((m) => m[1])
      .filter((u) => !u.includes("cdnjs") && !u.includes("jquery"));

    console.log(`${TAG} external scripts (${externalScripts.length}):`, externalScripts);

    for (const scriptPath of externalScripts.slice(0, 5)) {
      const scriptUrl = scriptPath.startsWith("http") ? scriptPath : `${BASE}${scriptPath}`;
      const { text: scriptJs, status } = await fetchText(scriptUrl, embedUrl);
      if (status === 200) {
        analyzeJs(`script:${scriptPath}`, scriptJs);
        const cn = findCloudnestraUrl(scriptJs);
        if (cn) {
          const { text: cnHtml } = await fetchText(cn, embedUrl);
          const m3u8 = findM3u8(cnHtml);
          if (m3u8) return successResponse(m3u8);
        }
      }
    }

    console.log(`${TAG} FAILED: all methods exhausted`);
    return NextResponse.json({ error: "could not extract stream" }, { status: 404 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${TAG} ERROR: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function successResponse(m3u8Url: string) {
  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
  const proxy = `/api/stream/proxy?url=${encodeURIComponent(m3u8Url)}&base=${encodeURIComponent(base)}`;
  console.log(`${TAG} SUCCESS → ${m3u8Url}`);
  console.log("=".repeat(60) + "\n");
  return NextResponse.json({ m3u8: proxy, raw: m3u8Url });
}
