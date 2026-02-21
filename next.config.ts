import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  compress: true,
  images: {
  domains: ["res.cloudinary.com"],
},
};

export default nextConfig;