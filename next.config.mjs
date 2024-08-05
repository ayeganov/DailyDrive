/** @type {import('next').NextConfig} */
const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_URL;

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/backend/api/:path*',
        destination: `${publicUrl}/api/:path*`,
      },
      {
        source: '/backend/auth/:path*',
        destination: `${publicUrl}/auth/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${publicUrl}/static/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev || process.env.ENABLE_SOURCE_MAPS === 'true')
    {
      config.devtool = 'source-map';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.daisyui.com",
        port: "",
        pathname: "/images/stock/**",
      }
    ]
  }
};

export default nextConfig;
