import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Picsum (browse)
      { protocol: "https", hostname: "picsum.photos",        pathname: "/**" },
      { protocol: "https", hostname: "fastly.picsum.photos", pathname: "/**" },
      // Pixabay CDN (search results)
      { protocol: "https", hostname: "cdn.pixabay.com",      pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com",          pathname: "/**" },
    ],
    // Allow all external images unoptimized as fallback
    dangerouslyAllowSVG: false,
  },
  reactStrictMode: true,
};

export default nextConfig;
