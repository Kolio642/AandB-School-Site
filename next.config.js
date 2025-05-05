/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
  },
  // Enable output compression
  compress: true,
  // Add performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  // Standard build output (not static export)
  distDir: '.next',
};

module.exports = nextConfig;
