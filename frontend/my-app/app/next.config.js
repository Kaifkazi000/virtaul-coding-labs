const isProd = process.env.NODE_ENV === "production";

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: isProd
          ? "https://virtual-coding-labs.onrender.com/api/:path*"
          : "http://localhost:5000/api/:path*",
      },
    ];
  },
};
