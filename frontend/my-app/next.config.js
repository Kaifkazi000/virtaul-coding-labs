const isProd = process.env.NODE_ENV === "production";
// Backend URL - Update this to match your deployed backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (isProd 
    ? "https://virtaul-coding-labs-j8o4.vercel.app" 
    : "http://localhost:5000");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
