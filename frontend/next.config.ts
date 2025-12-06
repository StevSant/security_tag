import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack (default in Next.js 16)
  turbopack: {},
  
  // PWA configuration will be handled via middleware and manifest
  // For production PWA, we'll use service worker registration manually
};

export default nextConfig;
