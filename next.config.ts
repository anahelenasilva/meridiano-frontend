import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/meridian',
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  trailingSlash: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
