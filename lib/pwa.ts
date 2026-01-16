'use client'

import { useEffect } from 'react'

export function usePWA() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker ready:', registration)

        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)

        // Listen for update found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('New version available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        })
      })

      // Handle service worker controller change
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [])

  return {
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isPWA: typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  }
}

// PWA Analytics
export function trackPWAInstall() {
  if (typeof window !== 'undefined') {
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully')
      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        })
      }
    })
  }
}

// Share API
export async function sharePage(title: string, text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      })
      return { success: true }
    } catch (error) {
      console.error('Error sharing:', error)
      return { success: false, error }
    }
  }
  return { success: false, error: 'Share API not supported' }
}

// Add to home screen prompt
export function canInstallPWA() {
  return typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window
}
