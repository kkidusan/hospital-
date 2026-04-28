import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://192.168.137.1:3000', 'localhost:3000', '192.168.137.1'],
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
};

export default nextConfig;