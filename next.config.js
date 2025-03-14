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
  },
  // Commenting out static export settings for now
  // output: 'export',
  // distDir: 'out',
  // trailingSlash: true,
};

module.exports = nextConfig;
