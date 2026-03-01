import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from './providers'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'
import { SessionSync } from '@/components/SessionSync'
import RouteLoader from '@/components/RouteLoader'

const metadataBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

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
  metadataBase: new URL(metadataBaseUrl),
  title: 'Chapter Curus - Gift & Flower Delivery | Same Day Delivery',
  description: 'Send flowers, cakes, and personalized gifts with same-day delivery. Express your love with Chapter Curus - Your trusted gift delivery partner.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chapter Curus - Flowers & Gifts',
  },
  applicationName: 'Chapter Curus',
  keywords: ['flowers', 'gifts', 'cakes', 'delivery', 'same day delivery', 'birthday gifts', 'anniversary gifts'],
  authors: [{ name: 'Chapter Curus' }],
  creator: 'Chapter Curus',
  publisher: 'Chapter Curus',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://fnp.com',
    siteName: 'Chapter Curus',
    title: 'Chapter Curus - Gift & Flower Delivery',
    description: 'Send flowers, cakes, and gifts with same-day delivery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chapter Curus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chapter Curus - Gift & Flower Delivery',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chapter Curus" />
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

