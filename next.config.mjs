const isProduction = process.env.NODE_ENV === "production";

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/osanpo",
  assetPrefix: isProduction ? "/osanpo/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
