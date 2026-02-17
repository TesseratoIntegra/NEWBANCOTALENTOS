import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
      optimizePackageImports: [
        'lucide-react',
        'react-bootstrap-icons',
        'recharts',
        '@heroicons/react',
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'bancodetalentos.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'bancodetalentos.tesseratointegra.com.br',
          pathname: '/media/**',
        },
      ],
    },
};

export default nextConfig;
