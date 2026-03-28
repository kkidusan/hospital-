/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'pg', '@prisma/adapter-pg'],
  },

  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;