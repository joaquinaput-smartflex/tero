import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for deployment behind Apache proxy at /tero
  basePath: "/dev/tero",

  // Output standalone for production deployment
  output: "standalone",

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
