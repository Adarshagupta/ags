import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import HomeRecommendationSection from '@/components/HomeRecommendationSection'
import HomeHero from '@/components/home/HomeHero'
import PremiumCategoryStrip from '@/components/home/PremiumCategoryStrip'
import SectionHeading from '@/components/home/SectionHeading'
import TrustStrip from '@/components/home/TrustStrip'
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
      <section key={category.id} className="space-y-5">
        <SectionHeading
          eyebrow="Collection"
          title={category.name}
          description="Scroll through a handpicked edit."
          href={`/categories/${category.id}`}
        />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
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
      <section key={category.id} className="space-y-5">
        <SectionHeading
          eyebrow="Featured"
          title={category.name}
          description="A signature pick with quick favourites."
          href={`/categories/${category.id}`}
          ctaLabel="Explore"
        />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
          {leadProduct ? (
            <Link
              href={`/products/${leadProduct.id}`}
              className="group relative min-h-[300px] overflow-hidden rounded-[30px] bg-cream-deep"
            >
              <Image
                src={resolveImageUrl(leadProduct.image)}
                alt={leadProduct.name}
                fill
                quality={72}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">{category.name}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{leadProduct.name}</h3>
                <p className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                  {formatPriceNoDecimals(leadProduct.price)}
                </p>
              </div>
            </Link>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {supportingProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center gap-3 rounded-[22px] border border-wine/10 bg-white p-3 transition hover:border-wine/25 hover:shadow-[0_18px_40px_-32px_rgba(124,42,71,0.7)]"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-cream">
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
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-sm font-semibold text-wine">{formatPriceNoDecimals(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section key={category.id} className="space-y-5">
      <SectionHeading
        eyebrow="Just In"
        title={category.name}
        description="Fresh arrivals from this collection."
        href={`/categories/${category.id}`}
      />
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
  const {
    settings,
    categories,
    occasionCategories,
    groupedCategories,
    homepageRecommendationProducts,
  } = await getHomeData()

  const tagline = settings.announcementText || settings.deliveryEstimate

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-28 pt-4 sm:px-6 lg:pb-12 lg:pt-6">
        <HomeHero siteName={settings.siteName || 'Upaharo'} tagline={tagline} />

        {settings.homepageShowTopCategories && categories.length > 0 ? (
          <section className="space-y-5">
            <SectionHeading
              eyebrow="Browse"
              title="Shop by category"
              description="Find the perfect gift for every kind of moment."
              href="/search"
              ctaLabel="See all"
            />
            <PremiumCategoryStrip categories={categories.slice(0, 10)} variant="round" />
          </section>
        ) : null}

        {settings.homepageShowRecommendations && homepageRecommendationProducts.length > 0 ? (
          <HomeRecommendationSection
            initialProducts={homepageRecommendationProducts}
            initialTitle={settings.homepageRecommendationTitle || 'Recommended for you'}
            initialDescription={
              String(settings.homepageRecommendationMode || 'LATEST').toUpperCase() === 'BEST_OFFER'
                ? 'Best discounts, curated for quick checkout.'
                : 'Freshly added to the collection.'
            }
          />
        ) : null}

        {settings.homepageShowOccasionTabs && occasionCategories.length > 0 ? (
          <section className="space-y-5">
            <SectionHeading eyebrow="Occasions" title="Shop the moment" description="Curated edits for life's celebrations." />
            <PremiumCategoryStrip categories={occasionCategories.slice(0, 10)} variant="tile" />
          </section>
        ) : null}

        <div id="featured" className="space-y-12">
          {groupedCategories.length === 0 && homepageRecommendationProducts.length === 0 ? (
            <div className="rounded-[30px] border border-wine/10 bg-white py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
                <svg className="h-8 w-8 text-wine/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">Our shelves are being restocked</h2>
              <p className="mt-1 text-sm text-ink/50">Beautiful gifts are on their way back. Please check in soon.</p>
            </div>
          ) : (
            <>
              {settings.homepageShowCategorySections
                ? groupedCategories.map((section, index) => renderCategorySection(section, index))
                : null}
            </>
          )}

          <div className="gold-divider" />

          <TrustStrip />
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
