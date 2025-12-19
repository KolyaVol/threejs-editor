/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for Next.js 16+
  turbopack: {
    rules: {
      // Handle texture files
      '*.{png,jpg,jpeg,gif,svg,webp}': {
        loaders: ['file-loader'],
        as: '*.js',
      },
    },
  },
  
  // Suppress warnings for missing textures
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Configure headers for proper CORS on assets
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // Enable static export if needed
  // output: 'export',
};

module.exports = nextConfig;
