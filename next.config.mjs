/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true
    },
    // Performance optimizations
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@prisma/client']
    },
    // Enable compression
    compress: true,
    // Optimize bundle
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            }
        }
        return config
    },
    // Add headers for better caching
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=300, s-maxage=300',
                    },
                ],
            },
        ]
    },
};

export default nextConfig;
