import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Move network origins here
  allowedDevOrigins: [
    'localhost:3000',
    '172.19.240.1:3000',
    '192.168.120.77:3000',
    '192.168.120.77'
  ],

  output: 'standalone',
  images: { 
    unoptimized: true 
  },

  // 3. Error handling
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // 4. Correct Headers format (if you need them)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },

  // 5. Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;