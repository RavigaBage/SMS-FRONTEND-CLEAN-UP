import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1920, 2048], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol:'https',
        hostname:'api.dicebear.com'
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      }
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || '')
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* ws://localhost:*"
          }
        ],
      },
    ];
  },

  experimental: {
    optimizeCss: false, 
    optimizePackageImports: ['lucide-react', 'date-fns', 'chart.js'],
  },
};

export default nextConfig;


