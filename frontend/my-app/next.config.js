const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: isProd
          ? "https://virtaul-coding-labs.onrender.com/api/:path*"
          : "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
