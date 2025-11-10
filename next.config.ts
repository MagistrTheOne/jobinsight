import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['better-auth'],
  
  // Next.js 16+ features
  // Cache Components (опционально - для использования "use cache" директивы)
  // cacheComponents: true,
  
  // React Compiler (опционально - для автоматической мемоизации)
  // experimental: {
  //   reactCompiler: true,
  // },
};

export default nextConfig;

