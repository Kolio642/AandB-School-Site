import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other Next.js config options
  output: 'export',
  // Exclude admin pages from static export
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    // Filter out admin routes from static export
    const filteredMap = {};
    for (const [path, config] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/admin')) {
        filteredMap[path] = config;
      }
    }
    return filteredMap;
  },
  // Add mdx support
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
  },
  // Configure mdx
  experimental: {
    mdxRs: true,
  },
};

export default nextConfig; 