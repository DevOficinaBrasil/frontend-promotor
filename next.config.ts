import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O valor pode ser em bytes, ou uma string como '10mb'
      bodySizeLimit: '20mb', 
      
    },
  },
};

export default nextConfig;
