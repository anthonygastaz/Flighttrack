import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint locally via `npm run lint`; skip during Vercel builds because
    // production installs omit devDependencies (eslint plugins).
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Airline logo CDN (used for booking detail pages).
      { protocol: "https", hostname: "pics.avs.io" },
      { protocol: "https", hostname: "images.kiwi.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
