/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverActions: {
  // O valor pode ser em bytes, ou uma string como '10mb'
  bodySizeLimit: '20mb', 
  
  },
}

export default nextConfig
