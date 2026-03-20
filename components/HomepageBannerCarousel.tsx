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
  const imageUrl = resolveImageUrl(activeBanner.image)

  const content = (
    <div className="group relative overflow-hidden rounded-[28px] bg-[#0e0e10] shadow-[0_26px_60px_-34px_rgba(15,23,42,0.75)]">
      <div className="absolute inset-0">
        <Image
          unoptimized
          src={imageUrl}
          alt={activeBanner.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_36%,rgba(0,0,0,0.24)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.46)_100%)]" />

      <div className="relative flex min-h-[210px] flex-col justify-between p-5 md:min-h-[250px] md:max-w-[52%] md:p-7">
        <div>
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
            Spotlight
          </span>
          <h2 className="mt-4 max-w-[11ch] text-[1.9rem] font-semibold leading-[1.02] text-white md:text-[2.35rem]">
            {activeBanner.title}
          </h2>
          {activeBanner.subtitle ? (
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-white/78 md:text-[15px]">{activeBanner.subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg">
            <span>Shop Now</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>

          <div className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
            AD
          </div>
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
                activeIndex === index ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300'
              }`}
              aria-label={`Show banner ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
