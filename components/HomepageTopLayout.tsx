'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LocationModal from '@/components/LocationModal'
import { resolveImageUrl } from '@/lib/image-url'
import { useLocationStore } from '@/lib/store/location'

type Category = {
  id: string
  name: string
  image?: string | null
}

type HomepageTopLayoutProps = {
  categories: Category[]
  occasionCategories: Category[]
  showTopCategories?: boolean
  showOccasionTabs?: boolean
}

const cardBackgrounds = [
  'from-[#ffe36b] via-[#ffd84b] to-[#ffc940]',
  'from-[#eef5ff] via-[#f7fbff] to-[#edf2ff]',
  'from-[#fff3ea] via-[#fff9f5] to-[#f7f2ff]',
  'from-[#eefbf4] via-[#f6fff8] to-[#e7f4ff]',
]

function CategoryAvatar({ category, size = 'large' }: { category: Category; size?: 'large' | 'small' }) {
  const dimensions = size === 'large' ? 'h-11 w-11 rounded-2xl' : 'h-10 w-10 rounded-xl'
  const imageUrl = category.image ? resolveImageUrl(category.image) : null

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden border border-white/70 bg-white/90 shadow-sm ${dimensions}`}>
        <Image unoptimized src={imageUrl} alt={category.name} fill className="object-cover" sizes="64px" />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center border border-white/70 bg-white/90 font-semibold text-slate-700 shadow-sm ${dimensions}`}
    >
      {category.name.charAt(0)}
    </div>
  )
}

function StaticTabIcon({ type }: { type: 'home' | 'latest' }) {
  const iconClassName = 'h-4 w-4'

  if (type === 'home') {
    return (
      <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M10 19v-4h4v4" />
      </svg>
    )
  }

  return (
    <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h10m-10 6h7" />
    </svg>
  )
}

export default function HomepageTopLayout({
  categories,
  occasionCategories,
  showTopCategories = true,
  showOccasionTabs = true,
}: HomepageTopLayoutProps) {
  const router = useRouter()
  const deliveryAddress = useLocationStore((state) => state.deliveryAddress)
  const currentLocation = useLocationStore((state) => state.currentLocation)
  const [mounted, setMounted] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const featuredCategories = showTopCategories ? categories.slice(0, 4) : []
  const quickOccasions = showOccasionTabs
    ? occasionCategories.length > 0
      ? occasionCategories.slice(0, 6)
      : categories.length > 4
        ? categories.slice(4, 8)
        : categories.slice(0, 4)
    : []
  const locationLabel = mounted
    ? deliveryAddress?.address || currentLocation?.address || deliveryAddress?.label || currentLocation?.label || 'Choose current location'
    : 'Choose current location'

  return (
    <>
      <section className="space-y-3">
        {featuredCategories.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className={`min-w-[84px] flex-1 rounded-[20px] border border-white/80 bg-gradient-to-br px-3 py-2.5 text-slate-900 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] transition-transform hover:-translate-y-0.5 ${
                  cardBackgrounds[index % cardBackgrounds.length]
                }`}
              >
                <CategoryAvatar category={category} />
                <p className="mt-2 text-[11px] font-semibold leading-tight text-slate-900 line-clamp-2 sm:text-xs">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="flex w-full items-center gap-2 px-1 py-0.5 text-left"
        >
          <svg className="h-4 w-4 flex-shrink-0 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 1 1 9.9 9.9L10 18.9l-4.95-4.95a7 7 0 0 1 0-9.9ZM10 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{locationLabel}</span>
          <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => router.push('/search')}
          className="flex w-full items-center gap-3 rounded-[16px] border border-[#d6e4ff] bg-white px-3.5 py-3 text-left shadow-[0_10px_28px_-24px_rgba(59,130,246,0.45)] ring-1 ring-[#dbe7ff]"
        >
          <svg className="h-4 w-4 flex-shrink-0 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
          <span className="truncate text-sm text-slate-500">Search products</span>
        </button>

        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          <Link href="#featured" className="flex min-w-[60px] flex-shrink-0 flex-col items-center gap-1.5 text-[#2159d6]">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#eaf3ff] shadow-sm">
              <StaticTabIcon type="home" />
            </span>
            <span className="text-xs font-semibold">For You</span>
            <span className="h-[3px] w-10 rounded-full bg-[#2563eb]" />
          </Link>

          <Link href="#latest" className="flex min-w-[60px] flex-shrink-0 flex-col items-center gap-1.5 text-slate-700">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white shadow-sm ring-1 ring-black/5">
              <StaticTabIcon type="latest" />
            </span>
            <span className="text-xs font-medium">Latest</span>
            <span className="h-[3px] w-10 rounded-full bg-transparent" />
          </Link>

          {quickOccasions.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex min-w-[60px] flex-shrink-0 flex-col items-center gap-1.5 text-slate-700"
            >
              <CategoryAvatar category={category} size="small" />
              <span className="line-clamp-1 text-xs font-medium">{category.name}</span>
              <span className="h-[3px] w-10 rounded-full bg-transparent" />
            </Link>
          ))}
        </div>
      </section>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </>
  )
}
