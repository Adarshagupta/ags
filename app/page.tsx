import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import HomeRecommendationSection from '@/components/HomeRecommendationSection'
import HomepageTopLayout from '@/components/HomepageTopLayout'
import HomepageBannerCarousel from '@/components/HomepageBannerCarousel'
import { prisma } from '@/lib/prisma'
import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { getAppSettings } from '@/lib/app-settings'
import { resolveImageUrl } from '@/lib/image-url'
import { findManyProductsCompat } from '@/lib/product-db'
import { formatPriceNoDecimals } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function renderCategorySection(
  section: { category: { id: string; name: string; image?: string | null }; products: any[] },
  index: number
) {
  const { category, products } = section
  const variant = index % 3

  if (variant === 1) {
    return (
      <section key={category.id} className="rounded-[30px] border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-500">Scroll through handpicked picks.</p>
          </div>
          <Link href={`/categories/${category.id}`} className="text-sm font-semibold text-pink-600 hover:text-pink-700">
            View All
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => (
            <div key={product.id} className="w-[172px] flex-shrink-0 sm:w-[210px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (variant === 2) {
    const leadProduct = products[0]
    const supportingProducts = products.slice(1, 4)

    return (
      <section key={category.id} className="rounded-[30px] border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-500">A featured pick with quick links.</p>
          </div>
          <Link href={`/categories/${category.id}`} className="text-sm font-semibold text-pink-600 hover:text-pink-700">
            Explore
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.25fr_0.95fr]">
          {leadProduct ? (
            <Link
              href={`/products/${leadProduct.id}`}
              className="group relative min-h-[260px] overflow-hidden rounded-[26px] bg-neutral-100"
            >
              <Image
                src={resolveImageUrl(leadProduct.image)}
                alt={leadProduct.name}
                fill
                quality={72}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{category.name}</p>
                <h3 className="mt-1 text-xl font-semibold leading-tight">{leadProduct.name}</h3>
                <p className="mt-2 text-sm font-semibold">{formatPriceNoDecimals(leadProduct.price)}</p>
              </div>
            </Link>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {supportingProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 transition hover:border-pink-200 hover:bg-white"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={resolveImageUrl(product.image)}
                    alt={product.name}
                    fill
                    quality={68}
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</p>
                  <p className="mt-1 text-sm font-semibold text-pink-600">{formatPriceNoDecimals(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section key={category.id} className="rounded-[30px] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
          <p className="text-sm text-gray-500">Fresh picks from this category.</p>
        </div>
        <Link href={`/categories/${category.id}`} className="text-sm font-semibold text-pink-600 hover:text-pink-700">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

async function getHomeData() {
  try {
    const [settings, categories, occasionCategories, products, banners] = await Promise.all([
      getAppSettings(),
      prisma.category.findMany({
        where: {
          type: 'PRODUCT',
          isActive: true,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
      prisma.category.findMany({
        where: {
          type: 'OCCASION',
          isActive: true,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
      findManyProductsCompat({
        where: {
          isAvailable: true,
          NOT: {
            tags: {
              has: ARCHIVED_PRODUCT_TAG,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 60,
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 6,
      }),
    ])

    const groupedCategories = categories
      .map((category) => ({
        category,
        products: products.filter((product) => product.category === category.name).slice(0, 4),
      }))
      .filter((section) => section.products.length > 0)

    const bestOfferProducts = [...products]
      .sort((left, right) => Number(right.discount || 0) - Number(left.discount || 0))
      .slice(0, 6)
    const latestProducts = products.slice(0, 6)
    const homepageRecommendationProducts =
      String(settings.homepageRecommendationMode || 'LATEST').toUpperCase() === 'BEST_OFFER'
        ? bestOfferProducts
        : latestProducts

    const homepageBanners =
      banners.length > 0
        ? banners
        : [
            {
              id: 'default-banner',
              title: settings.siteName,
              subtitle: settings.announcementText || settings.deliveryEstimate,
              image:
                'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1200&q=80',
              link: '/search',
            },
          ]

    return {
      settings,
      categories,
      occasionCategories,
      groupedCategories,
      latestProducts,
      homepageRecommendationProducts,
      homepageBanners,
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      settings: await getAppSettings(),
      categories: [],
      occasionCategories: [],
      groupedCategories: [],
      latestProducts: [],
      homepageRecommendationProducts: [],
      homepageBanners: [],
    }
  }
}

export default async function Home() {
  const { settings, categories, occasionCategories, groupedCategories, homepageRecommendationProducts, homepageBanners } =
    await getHomeData()

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="px-4 pt-3">
        <div className="mx-auto max-w-7xl">
          <HomepageTopLayout
            categories={categories}
            occasionCategories={occasionCategories}
            showTopCategories={settings.homepageShowTopCategories}
            showOccasionTabs={settings.homepageShowOccasionTabs}
          />
        </div>
      </div>

      {settings.homepageShowBanner ? (
        <div className="px-4 pt-2">
          <div className="mx-auto max-w-7xl">
            <HomepageBannerCarousel banners={homepageBanners} />
          </div>
        </div>
      ) : null}

      <div id="featured" className="space-y-6 px-4 py-2 pb-24 lg:pb-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {groupedCategories.length === 0 && homepageRecommendationProducts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white py-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No products available</p>
            </div>
          ) : (
            <>
              {settings.homepageShowRecommendations && homepageRecommendationProducts.length > 0 ? (
                <HomeRecommendationSection
                  initialProducts={homepageRecommendationProducts}
                  initialTitle={settings.homepageRecommendationTitle || 'Recommended Products'}
                  initialDescription={
                    String(settings.homepageRecommendationMode || 'LATEST').toUpperCase() === 'BEST_OFFER'
                      ? 'Best discount picks curated for quick checkout.'
                      : 'Recently added products from the catalog.'
                  }
                />
              ) : null}

              {settings.homepageShowCategorySections
                ? groupedCategories.map((section, index) => renderCategorySection(section, index))
                : null}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
