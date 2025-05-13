import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other Next.js config options
  
  // Remove the static export option to enable server-side rendering
  // output: 'export',
  
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