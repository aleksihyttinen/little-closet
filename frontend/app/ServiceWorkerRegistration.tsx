'use client'

import { useEffect } from 'react'
import { warmToken } from './api'

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        const register = () => {
            window.setTimeout(() => {
                void navigator.serviceWorker?.register('/sw.js').catch(() => {})
            }, 1500)
        }
        if (document.readyState === 'complete') register()
        else window.addEventListener('load', register, { once: true })

        const onVisible = () => {
            if (document.visibilityState !== 'visible') return
            warmToken()
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready
                    .then((registration) => registration.active?.postMessage({ type: 'WAKE_UP' }))
                    .catch(() => {})
            }
        }

        document.addEventListener('visibilitychange', onVisible)
        return () => {
            window.removeEventListener('load', register)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [])

    return null
}
