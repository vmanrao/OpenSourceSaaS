/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config ...
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' https://vmanrao.app.n8n.cloud https://cdn.jsdelivr.net;"
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig 