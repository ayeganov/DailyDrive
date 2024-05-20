/** @type {import('next').NextConfig} */
const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_URL;
console.log('publicUrl', publicUrl);
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/api/:path*',
        destination: `${publicUrl}/api/:path*`,
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
      console.log('Enabling source maps');
      config.devtool = 'source-map';
    }
    return config;
  }
};

export default nextConfig;
