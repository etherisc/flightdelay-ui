/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: [
            "component-lib", 
            "@mui/material", 
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-regular-svg-icons",
            "@fortawesome/free-solid-svg-icons",
        ]
    },
}

module.exports = nextConfig
