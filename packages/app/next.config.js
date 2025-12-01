/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
