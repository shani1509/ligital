import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ywn1mmfw8nkwmoe8.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
