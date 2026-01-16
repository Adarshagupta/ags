import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flowers N Petals - Gift & Flower Delivery | Same Day Delivery',
  description: 'Send flowers, cakes, and personalized gifts with same-day delivery. Express your love with FNP - Your trusted gift delivery partner.',
  manifest: '/manifest.json',
  themeColor: '#ec4899',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FNP - Flowers & Gifts',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
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
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FNP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <OfflineIndicator />
          <PWAInstallPrompt />
          {children}
        </Providers>
      </body>
    </html>
  )
}
