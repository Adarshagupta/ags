import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from './providers'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'
import { SessionSync } from '@/components/SessionSync'
import RouteLoader from '@/components/RouteLoader'

function isLocalOrigin(value?: string | null) {
  if (!value) return false

  try {
    const hostname = new URL(value).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

const isProduction = process.env.NODE_ENV === 'production'
const metadataBaseUrl = (() => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL

  if (isProduction && isLocalOrigin(configuredUrl)) {
    return undefined
  }

  return configuredUrl
})()

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
    themeColor: '#ec4899',
  }
}

export const metadata: Metadata = {
  ...(metadataBaseUrl ? { metadataBase: new URL(metadataBaseUrl) } : {}),
  title: 'Flowers N Petals - Gift & Flower Delivery | Same Day Delivery',
  description: 'Send flowers, cakes, and personalized gifts with same-day delivery. Express your love with FNP - Your trusted gift delivery partner.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FNP - Flowers & Gifts',
  },
  applicationName: 'Flowers N Petals',
  keywords: ['flowers', 'gifts', 'cakes', 'delivery', 'same day delivery', 'birthday gifts', 'anniversary gifts'],
  authors: [{ name: 'Flowers N Petals' }],
  creator: 'Flowers N Petals',
  publisher: 'Flowers N Petals',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://fnp.com',
    siteName: 'Flowers N Petals',
    title: 'Flowers N Petals - Gift & Flower Delivery',
    description: 'Send flowers, cakes, and gifts with same-day delivery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Flowers N Petals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flowers N Petals - Gift & Flower Delivery',
    description: 'Send flowers, cakes, and gifts with same-day delivery',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-512x512.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-512x512.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FNP" />
        <meta name="mobile-web-app-capable" content="yes" />
        {!isProduction && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(key) {
                      if (
                        key.indexOf('workbox') !== -1 ||
                        key.indexOf('next-pwa') !== -1 ||
                        key.indexOf('next-data') !== -1 ||
                        key.indexOf('next-image') !== -1 ||
                        key.indexOf('static-') !== -1 ||
                        key === 'start-url' ||
                        key === 'apis' ||
                        key === 'others'
                      ) {
                        caches.delete(key);
                      }
                    });
                  });
                }
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
          <SessionSync />
          <OfflineIndicator />
          <PWAInstallPrompt />
          {children}
        </Providers>
      </body>
    </html>
  )
}
