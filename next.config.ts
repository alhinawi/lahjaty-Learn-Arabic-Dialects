import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Static HTML export: the out/ folder is served by Cloudflare Pages.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
