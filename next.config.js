/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
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

  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    // Handle JSON parsing issues by ignoring problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-remove-scroll': false,
    };
    
    return config;
  },
}

module.exports = nextConfig
