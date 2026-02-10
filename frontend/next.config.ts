import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8000',
          pathname: '/media/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8025',
          pathname: '/media/**',
        },
        {
          protocol: 'http',
          hostname: '192.168.0.77',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'bancodetalentos.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
      ],
    },
};

export default nextConfig;
