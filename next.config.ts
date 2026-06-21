import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" workspace-root warning in monorepo layouts
  turbopack: {
    root: __dirname,
  },

  // Allow Supabase storage images (org logos, document thumbnails)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
