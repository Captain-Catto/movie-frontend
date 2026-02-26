import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const remoteImageHosts = [
  "image.tmdb.org",
  "images.unsplash.com",
  "static.nutscdn.com",
  "lh3.googleusercontent.com",
  "datlqt-movie-stream.s3.ap-southeast-1.amazonaws.com",
  "avatars.githubusercontent.com",
  "flagcdn.com",
];

const nextConfig: NextConfig = {
  images: {
    // Keep optimization enabled by default, but allow quickly disabling on Vercel
    // if usage limits or remote fetch timeouts become a deployment blocker.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
    formats: ["image/avif", "image/webp"],
    // Mobile-first widths to reduce overfetch on 360/390/414 devices.
    deviceSizes: [360, 390, 414, 640, 750, 828, 1080, 1200, 1920],
    // Add a 192px candidate so poster cards don't overfetch 256px assets.
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: remoteImageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
