import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/generative-ai"],
  experimental: {
    useTypeScriptCli: false,
  },
  async redirects() {
    return [
      {
        source: "/divisions/academy",
        destination: "/academy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
