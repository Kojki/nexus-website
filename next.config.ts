import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // ← この1行が404エラーを防ぐための追加部分です
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;
