/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cookmark/core', '@cookmark/ui'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
