import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  compress: true,
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https", // 👈 keep as literal
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig as any);