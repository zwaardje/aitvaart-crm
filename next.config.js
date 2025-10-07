/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimize for Vercel
  // output: 'standalone', // Temporarily disabled
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
