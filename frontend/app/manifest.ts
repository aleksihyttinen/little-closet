import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Little Closet',
        short_name: 'LittleCloset',
        description: "An app to manage your baby's clothes",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f9f3e9',
        theme_color: '#f9f3e9',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}