import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 requires generateBuildId to be set explicitly — without it the
  // build crashes because the default is not applied to this option.
  // Returning null tells Next.js to use its built-in nanoid fallback.
  generateBuildId: async () => null,
};

export default nextConfig;
