import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiDomain = process.env.NEXT_PUBLIC_API_URL ?? "";

const allowedImageHostnames = [
  "www.gstatic.com",
  "i.pravatar.cc",
  "api.dicebear.com",
  "ui-avatars.com",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  compiler: {
    removeConsole: isDev ? false : { exclude: ["error", "warn"] },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 1080, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, 
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment", 
    contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
    remotePatterns: allowedImageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },

  async headers() {
    const remoteImgSrc = allowedImageHostnames
      .map((h) => `https://${h}`)
      .join(" ");

    const cspDirectives = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "script-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${remoteImgSrc}`,
      `connect-src 'self' ${apiDomain}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: cspDirectives },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  experimental: {
    optimizeCss: false,
    optimizePackageImports: ["lucide-react", "date-fns", "chart.js"],
  },
};

export default nextConfig;