/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize for Vercel deployment
  experimental: {
    // Exclude large dependencies from serverless functions
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/@next/swc-linux-x64-gnu',
        'node_modules/@next/swc-linux-x64-musl',
        'node_modules/webpack',
        'node_modules/terser',
      ],
    },
  },
  
  // External packages for server components
  serverComponentsExternalPackages: [
    '@storacha/client',
    'ethers',
  ],
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      'pino-pretty': false,
      encoding: false,
      '@react-native-async-storage/async-storage': false,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    
    // Externalize heavy dependencies on server
    if (isServer) {
      config.externals.push({
        'pino-pretty': 'commonjs pino-pretty',
        'lokijs': 'commonjs lokijs',
        'encoding': 'commonjs encoding',
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;

