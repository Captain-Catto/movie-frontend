import type { Metadata } from "next";
import { inter, roboto } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "MovieStream",
  description: "Trang web xem phim trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
