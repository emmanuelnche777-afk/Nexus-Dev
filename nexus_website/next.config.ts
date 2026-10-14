import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["@google/generative-ai"],
  experimental: {
    useTypeScriptCli: false,
    globalNotFound: true,
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
