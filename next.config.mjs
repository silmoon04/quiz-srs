/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  },
};

export default nextConfig;
