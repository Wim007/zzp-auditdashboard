/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'bcryptjs'],
  },
}

export default nextConfig
