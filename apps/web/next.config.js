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
};

module.exports = nextConfig;
