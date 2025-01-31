import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['scontent.fsvq6-1.fna.fbcdn.net', 'via.placeholder.com'],
   
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '66.70.189.110',
        pathname: '/api/users/*',
        port: '',
        search: '',
      },
    ],
  },
};

export default nextConfig;
