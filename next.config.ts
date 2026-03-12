import type { NextConfig } from "next";

let supabaseHostname = "*.supabase.co";
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl && supabaseUrl.startsWith("http")) {
    supabaseHostname = new URL(supabaseUrl).hostname;
  }
} catch {}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
