import path from 'node:path'
import type { NextConfig } from 'next'
import { loadEnvConfig } from '@next/env'
import withSerwistInit from '@serwist/next'

const { combinedEnv } = loadEnvConfig(
  path.resolve(__dirname, '..'),
  process.env.NODE_ENV !== 'production',
  undefined,
  true,
)

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
})

const nextConfig: NextConfig = {
  env: {
    NEON_AUTH_URL: combinedEnv.NEON_AUTH_URL,
  },
}

export default withSerwist(nextConfig)
