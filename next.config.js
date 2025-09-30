/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'imagedelivery.net', 'i.imgur.com'],
  },
  transpilePackages: ['framer-motion'],
  
  // Webpack config to handle Web3 dependencies  
  webpack: (config, { webpack, isServer }) => {
    // Ignore Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'pino-pretty': false,
        '@react-native-async-storage/async-storage': false,
      }
      
      // Ignore problematic modules that cause build errors
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
        '@react-native-async-storage/async-storage': false,
      }
      
      // Add ignore plugin for specific modules - correct webpack plugin usage
      if (webpack.IgnorePlugin) {
        config.plugins.push(
          new webpack.IgnorePlugin({
            resourceRegExp: /^(@react-native-async-storage\/async-storage|pino-pretty)$/,
          })
        )
      }
    }
    
    return config
  },
  
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  
  async headers() {
    return [
      {
        source: '/.well-known/farcaster.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
