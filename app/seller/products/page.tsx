'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  isAvailable: boolean
  discount: number
  createdAt: string
}

export default function SellerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to toggle availability:', error)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  return (
    <div className="px-4 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 text-sm">Manage your product catalog</p>
        </div>
        <button
          onClick={() => router.push('/seller/products/new')}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm md:text-base shadow-sm transition-colors"
        >
          + Add
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Add your first product to get started</p>
          <button
            onClick={() => router.push('/seller/products/new')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-block transition-colors"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 md:h-24 md:w-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          product.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isAvailable ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-sm">
                        <span className="font-semibold text-gray-900">₹{product.price}</span>
                        {product.discount > 0 && (
                          <span className="text-green-600">{product.discount}% off</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => router.push(`/seller/products/${product.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(product.id, product.isAvailable)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {product.isAvailable ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
