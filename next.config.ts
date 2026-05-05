import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/tosspos-tax-plugin",
  images: { unoptimized: true },
};

export default nextConfig;
