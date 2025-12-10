/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    transpilePackages: ['@apexseo/ui'], // Ensures UI package is transpiled
    images: {
        domains: ['apexseo.space'],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "onnxruntime-node": false,
        }
        return config;
    },
};

module.exports = nextConfig;
