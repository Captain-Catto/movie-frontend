import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/favorites/",
        "/notifications/",
        "/login",
        "/auth/",
      ],
    },
    sitemap: "https://movie.lequangtridat.com/sitemap.xml",
  };
}
