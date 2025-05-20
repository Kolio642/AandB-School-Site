/**
 * @type {import('next').NextConfig}
 */
const path = require('path');

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
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  distDir: '.next',
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  experimental: {
    // These settings improve Linux compatibility
    esmExternals: 'loose',
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://jnshvcouguryatgpmasw.supabase.co; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; frame-src 'self' https://*.supabase.co;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
