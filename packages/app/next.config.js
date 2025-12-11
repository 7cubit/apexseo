/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@apexseo/shared'],
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
    output: 'standalone',
};

module.exports = nextConfig;
