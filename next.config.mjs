import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn.sofifa.net",
      },
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "sports.bzzoiro.com",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
      },
      {
        protocol: "https",
        hostname: "cdn.nba.com",
      },
      {
        protocol: "https",
        hostname: "e0.365dm.com",
      },
      {
        protocol: "https",
        hostname: "e1.365dm.com",
      },
      {
        protocol: "https",
        hostname: "e2.365dm.com",
      },
      {
        protocol: "https",
        hostname: "e3.365dm.com",
      },
      {
        protocol: "https",
        hostname: "e4.365dm.com",
      },
      {
        protocol: "https",
        hostname: "**.365dm.com",
      },
      {
        protocol: "https",
        hostname: "i.guim.co.uk",
      },
      {
        protocol: "https",
        hostname: "ichef.bbci.co.uk",
      },
      {
        protocol: "https",
        hostname: "wp.clutchpoints.com",
      },
      {
        protocol: "https",
        hostname: "clutchpoints.com",
      },
      {
        protocol: "https",
        hostname: "s.yimg.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
