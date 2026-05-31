import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
if (!process.env.API_URL) {
  console.warn("WARNING: API_URL is not set — falling back to http://localhost:4000. Set API_URL in production.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
