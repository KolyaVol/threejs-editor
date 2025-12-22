import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle optimization
  swcMinify: true,
  compress: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate Three.js into its own chunk
            three: {
              name: 'three',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 20,
            },
            // Separate React Three Fiber
            r3f: {
              name: 'r3f',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@react-three[\\/]/,
              priority: 15,
            },
            // Common vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
          },
        },
      };
    }
    return config;
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
};

export default nextConfig;
