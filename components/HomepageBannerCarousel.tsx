'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resolveImageUrl } from '@/lib/image-url'

type Banner = {
  id: string
  title: string
  subtitle?: string | null
  image: string
  link?: string | null
}

export default function HomepageBannerCarousel({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) {
    return null
  }

  const activeBanner = banners[activeIndex]
  const content = (
    <div className="relative block overflow-hidden rounded-[28px] bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 shadow-lg">
      <div className="grid min-h-[220px] items-stretch md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 flex flex-col justify-between p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Featured</p>
            <h2 className="mt-3 max-w-md text-2xl font-semibold leading-tight text-white md:text-3xl">
              {activeBanner.title}
            </h2>
            {activeBanner.subtitle ? (
              <p className="mt-3 max-w-sm text-sm text-white/85 md:text-base">{activeBanner.subtitle}</p>
            ) : null}
          </div>
          {activeBanner.link ? (
            <span className="mt-5 inline-flex w-fit items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-rose-600 shadow-sm">
              Explore Now
            </span>
          ) : null}
        </div>

        <div className="relative min-h-[180px]">
          <Image
            unoptimized
            src={resolveImageUrl(activeBanner.image)}
            alt={activeBanner.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {activeBanner.link ? <Link href={activeBanner.link}>{content}</Link> : content}
      {banners.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index ? 'w-8 bg-pink-600' : 'w-2.5 bg-pink-200'
              }`}
              aria-label={`Show banner ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
