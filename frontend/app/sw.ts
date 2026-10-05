import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { NetworkFirst } from 'workbox-strategies'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: WorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    ...defaultCache,

    {
      matcher: ({ url, request }) =>
        request.method === 'GET' &&
        url.pathname === '/api/v1/clothing',

      handler: new NetworkFirst({
        cacheName: 'api-clothing',
        networkTimeoutSeconds: 3,
      }),
    },

    {
      matcher: ({ url, request }) =>
        request.method === 'GET' &&
        url.pathname === '/api/v1/size',

      handler: new NetworkFirst({
        cacheName: 'api-size',
        networkTimeoutSeconds: 3,
      }),
    },

    {
      matcher: ({ url, request }) =>
        request.method === 'GET' &&
        url.pathname === '/api/v1/category',

      handler: new NetworkFirst({
        cacheName: 'api-category',
        networkTimeoutSeconds: 3,
      }),
    },
  ],
})

serwist.addEventListeners()

self.addEventListener('message', (event) => {
  const data = (event as MessageEvent).data

  if (data?.type === 'CLEAR_API_CACHE') {
    void Promise.all([
      caches.delete('api-clothing'),
      caches.delete('api-size'),
      caches.delete('api-category'),
    ])
  }
})