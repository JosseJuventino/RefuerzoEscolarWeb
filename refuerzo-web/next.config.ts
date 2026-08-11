import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3005", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3005", pathname: "/uploads/**" },
      { protocol: "https", hostname: "refuerzo-mendoza.me" },
      { protocol: "https", hostname: "**.refuerzo-mendoza.me" },
      { protocol: "https", hostname: "scontent.fsvq6-1.fna.fbcdn.net" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
