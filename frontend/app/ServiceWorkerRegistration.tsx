'use client'

import { useEffect } from 'react'
import { warmToken } from './api'

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        warmToken()

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
        }

        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('pageshow', warmToken)
        return () => {
            window.removeEventListener('load', register)
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('pageshow', warmToken)
        }
    }, [])

    return null
}
