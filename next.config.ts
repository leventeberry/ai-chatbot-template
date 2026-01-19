import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  (process.env.DOCKER_ENV === "true"
    ? "http://api:8080"
    : "http://localhost:8080");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
