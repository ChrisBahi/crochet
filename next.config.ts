import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/apply", destination: "/register", permanent: true },
      { source: "/candidater", destination: "/register", permanent: true },
    ]
  },
};

export default nextConfig;
