import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // transpilePackages: ['@repo/prisma'],
  output: 'standalone',
  // This tells Next.js to bundle `@prisma/client` and its runtime
  // instead of trying to treat it as an external dependency.
  serverExternalPackages: [],
};

export default nextConfig;
