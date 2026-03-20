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
    <div className="group relative overflow-hidden rounded-[30px] border border-rose-100/80 bg-[#fff8f4] shadow-[0_24px_70px_-34px_rgba(236,72,153,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,240,244,0.72)_42%,_rgba(255,229,236,0.5)_100%)]" />
      <div className="absolute -left-12 top-5 h-32 w-32 rounded-full bg-rose-200/55 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl" />

      <div className="relative grid min-h-[178px] gap-4 md:min-h-[220px] md:grid-cols-[1.08fr_0.92fr]">
        <div className="z-10 flex flex-col justify-between p-4 md:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500 shadow-sm">
                Same Day
              </span>
              <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                Gift Ready
              </span>
            </div>

            <h2 className="mt-3 max-w-[14ch] text-[1.45rem] font-semibold leading-[1.05] text-slate-900 md:text-[2rem]">
              {activeBanner.title}
            </h2>

            {activeBanner.subtitle ? (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 md:text-[15px]">
                {activeBanner.subtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg md:text-sm">
              <span>Shop Collection</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>

            <div className="hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/72 px-3 py-2 shadow-sm sm:flex">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Curated</p>
                <p className="text-xs font-medium text-slate-700">Fresh picks</p>
              </div>
              <div className="h-8 w-px bg-rose-100" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Dispatch</p>
                <p className="text-xs font-medium text-slate-700">Fast delivery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div
            className="absolute inset-y-5 left-0 right-5 rounded-[28px] border border-white/70 bg-white/45 backdrop-blur-sm"
            style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
          />

          <div className="absolute right-5 top-5 h-[calc(100%-2.5rem)] w-[67%] overflow-hidden rounded-[28px] shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)]">
            <Image
              unoptimized
              src={imageUrl}
              alt={activeBanner.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 38vw"
            />
          </div>

          <div className="absolute left-4 top-6 max-w-[180px] rounded-[22px] border border-white/75 bg-white/88 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.5)] backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Spotlight</p>
            <p className="mt-2 text-sm font-semibold leading-snug text-slate-900">
              Handpicked gifting, packed for quick dispatch.
            </p>
          </div>

          <div className="absolute bottom-6 left-0 rounded-[22px] bg-rose-500 px-4 py-3 text-white shadow-[0_16px_35px_-24px_rgba(244,63,94,0.65)]">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/75">Featured Drop</p>
            <p className="mt-1 text-sm font-semibold">{String(activeIndex + 1).padStart(2, '0')}</p>
          </div>
        </div>

        <div className="relative mx-4 mb-4 h-28 md:hidden">
          <div className="absolute inset-0 rounded-[22px] border border-white/70 bg-white/50 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-[72%] overflow-hidden rounded-[22px] shadow-[0_16px_35px_-24px_rgba(15,23,42,0.45)]">
            <Image
              unoptimized
              src={imageUrl}
              alt={activeBanner.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute bottom-3 left-0 max-w-[62%] rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">Featured</p>
            <p className="mt-1 text-xs font-semibold leading-snug text-slate-900 line-clamp-2">{activeBanner.title}</p>
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
                activeIndex === index ? 'w-8 bg-rose-500' : 'w-2.5 bg-rose-200'
              }`}
              aria-label={`Show banner ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
