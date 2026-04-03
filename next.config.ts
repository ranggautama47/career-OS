import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize package imports — tree-shake icons supaya tidak load semua
  // Lucide punya 1000+ icons, tanpa ini semua di-bundle sekaligus
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
    ],
  },

  // Compress response
  compress: true,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
