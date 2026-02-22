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
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "connect-src 'self' http://localhost:8000 https://your-api-domain.com",
            ].join("; "),
          },
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


