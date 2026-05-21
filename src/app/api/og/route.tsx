import { ImageResponse } from "next/og";

export const runtime = "edge";

const PAGE_STYLE: Record<
  string,
  { label: string; accent: string; glow: string }
> = {
  home: {
    label: "MovieStream",
    accent: "#ef233c",
    glow: "rgba(239, 35, 60, 0.35)",
  },
  trending: {
    label: "Trending",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  movies: {
    label: "Movies",
    accent: "#ef233c",
    glow: "rgba(239, 35, 60, 0.35)",
  },
  tv: {
    label: "TV Series",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.35)",
  },
  people: {
    label: "People",
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.35)",
  },
};

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "home";
  const title = searchParams.get("title") || "MovieStream";
  const description =
    searchParams.get("description") ||
    "Discover movies, TV series, and trending content.";
  const style = PAGE_STYLE[page] || PAGE_STYLE.home;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #070b16 0%, #111827 55%, #020617 100%)",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            right: -150,
            top: -170,
            background: style.glow,
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 440,
            height: 440,
            left: -170,
            bottom: -180,
            background: "rgba(59, 130, 246, 0.18)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), transparent 28%), linear-gradient(90deg, rgba(2,6,23,0.95), rgba(2,6,23,0.35))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            padding: "72px 84px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 58,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: style.accent,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderLeft: "18px solid #ffffff",
                  marginLeft: 4,
                }}
              />
            </div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>MovieStream</div>
            <div
              style={{
                fontSize: 24,
                color: "#cbd5e1",
                paddingLeft: 18,
                borderLeft: "2px solid rgba(203, 213, 225, 0.28)",
              }}
            >
              {style.label}
            </div>
          </div>

          <div
            style={{
              maxWidth: 860,
              fontSize: 72,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            {title}
          </div>
          <div
            style={{
              maxWidth: 820,
              marginTop: 28,
              color: "#cbd5e1",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
