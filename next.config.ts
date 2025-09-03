import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'image.tmdb.org',
      'images.unsplash.com',
      'static.nutscdn.com'
    ],
  },
};

export default nextConfig;
