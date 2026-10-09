import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default — WASM is handled automatically
  turbopack: {},

  // Required headers for SharedArrayBuffer (used by @imgly/background-removal WASM)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
