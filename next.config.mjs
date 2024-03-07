/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "via.placeholder.com"
            },
            {
                protocol: "https",
                hostname: "kai-website-kommade.s3.ap-southeast-1.amazonaws.com"
            }
        ]
    },
}

export default nextConfig;
