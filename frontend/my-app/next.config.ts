import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
  (isProd
    ? "https://virtaul-coding-labs-j8o4.vercel.app"
    : "http://localhost:5000");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
