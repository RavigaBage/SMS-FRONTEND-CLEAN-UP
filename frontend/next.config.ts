import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";


const allowedImageHostnames = (
  process.env.ALLOWED_IMAGE_HOSTS ??
  "www.gstatic.com,i.pravatar.cc,api.dicebear.com,ui-avatars.com"
)
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const isHttps =
  process.env.FORCE_HTTPS === "true" ||
  (!isDev && apiUrl.startsWith("https://"));

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

    remotePatterns: allowedImageHostnames.flatMap((hostname) => [
      { protocol: "https", hostname },
      { protocol: "http", hostname },
    ]),
  },

  async headers() {
    const remoteImgSrc = allowedImageHostnames
      .flatMap((h) => [`https://${h}`, `http://${h}`])
      .join(" ");

    const cspDirectives = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "script-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${remoteImgSrc}`,

      `connect-src 'self'${apiUrl ? ` ${apiUrl}` : ""}${
        isDev ? " ws://localhost:* http://localhost:*" : ""
      }`,

      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",

      ...(isHttps ? ["upgrade-insecure-requests"] : []),
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

      ...(isHttps
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),

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