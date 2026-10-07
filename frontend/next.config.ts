import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
})

const nextConfig: NextConfig = {
  output: 'export',

  env: {
    NEON_AUTH_URL: process.env.NEON_AUTH_URL,
  },
}

export default withSerwist(nextConfig)