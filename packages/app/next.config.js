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
    transpilePackages: ['@apexseo/shared', '@apexseo/ui'],
    images: {
        domains: ['apexseo.space'],
    },
};

module.exports = nextConfig;
