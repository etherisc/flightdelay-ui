/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        optimizePackageImports: [
            "component-lib", 
            "@mui/material", 
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/pro-solid-svg-icons",
            "@fortawesome/pro-regular-svg-icons",
        ]
    },
}

module.exports = nextConfig
