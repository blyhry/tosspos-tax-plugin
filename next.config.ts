import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/merchant-tax-saving",
  images: { unoptimized: true },
};

export default nextConfig;
