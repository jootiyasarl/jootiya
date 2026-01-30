/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ssfcfvuosxxmvsdoktws.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
