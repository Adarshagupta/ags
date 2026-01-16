import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import CategorySection from '@/components/CategorySection'
import SearchBar from '@/components/SearchBar'
import { prisma } from '@/lib/prisma'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Search Bar */}
      <SearchBar />

      {/* Delivery Banner */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
            <div>
              <h3 className="font-bold text-base mb-1">FREE DELIVERY!!!</h3>
              <p className="text-xs opacity-90">On eligible delivery time slots.</p>
            </div>
            <div className="text-4xl">🚚</div>
          </div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <CategorySection type="PRODUCT" title="" />
        </div>
      </div>

      {/* AGS Luxe & Quick Actions */}
      <div className="px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 gap-3">
            <button className="flex flex-col items-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-2">
                <span className="text-white text-xs font-bold">LUXE</span>
              </div>
              <span className="text-xs text-gray-700 text-center">AGS Luxe</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mb-2">
                <span className="text-3xl">🛵</span>
              </div>
              <span className="text-xs text-gray-700 text-center">Same Day</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-2">
                <span className="text-3xl">🖼️</span>
              </div>
              <span className="text-xs text-gray-700 text-center">Personalised</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-2">
                <span className="text-3xl">🪴</span>
              </div>
              <span className="text-xs text-gray-700 text-center">Plants</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-2">
                <span className="text-3xl">🎂</span>
              </div>
              <span className="text-xs text-gray-700 text-center">Cakes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Sweet Romance,</h2>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Wrapped & Delivered</h3>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
                ORDER NOW
              </button>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="text-6xl">🎁❤️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Recipient */}
      <div className="px-4 py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Shop by Recipient</h2>
          <CategorySection type="RECIPIENT" title="" />
        </div>
      </div>

      {/* Shop by Occasion */}
      <div className="px-4 py-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Shop by Occasion</h2>
          <CategorySection type="OCCASION" title="" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-6 bg-gray-50 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trending Gifts</h2>
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-3">🎁</div>
              <h3 className="text-base font-semibold text-gray-900">No gifts available</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

