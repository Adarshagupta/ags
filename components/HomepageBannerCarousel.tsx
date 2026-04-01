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
    <div className="group relative overflow-hidden rounded-[28px] bg-white shadow-[0_22px_50px_-34px_rgba(15,23,42,0.4)]">
      <div className="relative min-h-[210px] md:min-h-[250px]">
        <Image
          src={imageUrl}
          alt={activeBanner.title}
          fill
          priority
          quality={75}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 70vw"
        />
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
