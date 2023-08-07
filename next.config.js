/** @type {import('next').NextConfig} */

const withPwa = require('next-pwa');

const nextConfig = {
    reactStrictMode: true,
    images: {
        loader: 'custom',
    },
    pwa: {
        disable: process.env.NODE_ENV === 'development',
        dest: 'public',
    },
};

module.exports = withPwa(nextConfig);
