import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/login", "/auth/"],
    },
    sitemap: "https://movie.lequangtridat.com/sitemap.xml",
  };
}
