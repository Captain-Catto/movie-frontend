import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "image.tmdb.org",
      "images.unsplash.com",
      "static.nutscdn.com",
      "lh3.googleusercontent.com",
      "datlqt-movie-stream.s3.ap-southeast-1.amazonaws.com",
    ],
  },
};

export default nextConfig;
