import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.*'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
