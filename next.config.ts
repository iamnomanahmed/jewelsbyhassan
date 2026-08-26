import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The compiler API keeps type validation in-process and avoids an extra CLI
    // subprocess. `npm run typecheck` remains the canonical strict type gate.
    useTypeScriptCli: false
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "assets.hassanjewels.com" }
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82, 88],
    minimumCacheTTL: 60 * 60 * 24
  },
  poweredByHeader: false
};

export default nextConfig;
