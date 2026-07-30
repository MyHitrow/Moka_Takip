import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resim optimizasyonu için Supabase Storage domain'i
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
