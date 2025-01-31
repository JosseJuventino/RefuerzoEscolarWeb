import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
    reactRemoveProperties: true,
  },
  experimental: {
    proxyTimeout: 30000,
    optimisticClientCache: true,
  },
  swcMinify: true,
  cacheHandler: require.resolve("./cache-handler.js"),
  cacheMaxMemorySize: 50,

  images: {
    domains: ["scontent.fsvq6-1.fna.fbcdn.net", "via.placeholder.com"],

    remotePatterns: [
      {
        protocol: "http",
        hostname: "66.70.189.110",
        pathname: "/api/users/*",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
