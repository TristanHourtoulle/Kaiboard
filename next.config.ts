import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // For server-side, allow Node.js built-ins
      config.externals = config.externals || [];
      
      // Add a function to handle all node: protocol modules
      config.externals.push(function ({ context, request }: any, callback: any) {
        if (request.startsWith('node:')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      });
    } else {
      // For client-side, provide fallbacks or ignore Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'path': false,
        'os': false,
        'crypto': false,
        'util': false,
        'url': false,
        'stream': false,
        'buffer': false,
        'module': false,
        'net': false,
        'tls': false,
        'http': false,
        'https': false,
        'zlib': false,
        'querystring': false,
        'readline': false,
        'events': false,
      };
    }
    return config;
  },
  /* config options here */
};

export default nextConfig;
