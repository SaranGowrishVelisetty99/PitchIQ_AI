import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  ...(API_URL
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${API_URL}/api/:path*`,
            },
            {
              source: "/health",
              destination: `${API_URL}/health`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
