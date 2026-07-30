import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // geoip-lite resolves its bundled .dat files via __dirname at runtime — bundling it through
  // Turbopack/webpack breaks that resolution, so it needs to stay external and use Node's native
  // require instead.
  serverExternalPackages: ["geoip-lite"],
};

export default nextConfig;
