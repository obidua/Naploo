/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@naploo/ui'],
  images: {
    unoptimized: true,
    domains: ['naploo.com', 'localhost'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=30',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
