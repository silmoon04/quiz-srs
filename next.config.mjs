/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const buildCSP = () => {
  const directives = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'none'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'media-src': ["'self'", 'https:'],
    'font-src': ["'self'", 'https:', 'data:'],
    'form-action': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'script-src': isDev
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
      : ["'self'", "'unsafe-inline'"],
    'connect-src': isDev
      ? ["'self'", 'https:', 'ws:', 'wss:']
      : ["'self'", 'https:'],
  };
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

const nextConfig = {
  // GitHub Pages deployment configuration
  basePath: process.env.GITHUB_ACTIONS ? '/quiz-srs' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/quiz-srs/' : '',
  output: 'export',
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildCSP(),
          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
