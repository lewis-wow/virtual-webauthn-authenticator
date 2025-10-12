import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/better-auth'],
  output: 'standalone',
};

export default nextConfig;
