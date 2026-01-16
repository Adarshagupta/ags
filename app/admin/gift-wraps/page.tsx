'use client'

import { useEffect, useState } from 'react'

interface GiftWrap {
  id: string
  name: string
  description: string | null
  price: number
  image: string
  type: string
  isActive: boolean
}

export default function AdminGiftWraps() {
  const [giftWraps, setGiftWraps] = useState<GiftWrap[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWrap, setEditingWrap] = useState<GiftWrap | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    type: 'premium',
    isActive: true
  })

  useEffect(() => {
    fetchGiftWraps()
  }, [])

  const fetchGiftWraps = async () => {
    try {
      const res = await fetch('/api/admin/gift-wraps')
      if (res.ok) {
        const data = await res.json()
        setGiftWraps(data)
      }
    } catch (error) {
      console.error('Error fetching gift wraps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingWrap
        ? `/api/admin/gift-wraps/${editingWrap.id}`
        : '/api/admin/gift-wraps'
      const method = editingWrap ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchGiftWraps()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving gift wrap:', error)
    }
  }

  const deleteWrap = async (id: string) => {
    if (!confirm('Delete this gift wrap?')) return
    try {
      const res = await fetch(`/api/admin/gift-wraps/${id}`, { method: 'DELETE' })
      if (res.ok) fetchGiftWraps()
    } catch (error) {
      console.error('Error deleting gift wrap:', error)
    }
  }

  const editWrap = (wrap: GiftWrap) => {
    setEditingWrap(wrap)
    setFormData({
      name: wrap.name,
      description: wrap.description || '',
      price: wrap.price,
      image: wrap.image,
      type: wrap.type,
      isActive: wrap.isActive
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, image: '', type: 'premium', isActive: true })
    setEditingWrap(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Wraps</h1>
          <p className="text-gray-600 mt-1">Manage gift wrapping options</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold"
        >
          {showForm ? 'Cancel' : '+ Add Gift Wrap'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingWrap ? 'Edit Gift Wrap' : 'New Gift Wrap'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="premium">Premium</option>
                  <option value="eco-friendly">Eco-Friendly</option>
                  <option value="themed">Themed</option>
                  <option value="simple">Simple</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold">
                {editingWrap ? 'Update' : 'Create'} Gift Wrap
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gift Wraps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-gray-500">Loading...</div>
        ) : giftWraps.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">No gift wraps yet</div>
        ) : (
          giftWraps.map((wrap) => (
            <div key={wrap.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{wrap.name}</h3>
                  <p className="text-sm text-gray-500">{wrap.type}</p>
                  <p className="text-lg font-semibold text-orange-600">₹{wrap.price.toFixed(2)}</p>
                </div>
                {wrap.isActive && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
              {wrap.description && (
                <p className="text-sm text-gray-600 mb-3">{wrap.description}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => editWrap(wrap)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Edit
                </button>
                <button onClick={() => deleteWrap(wrap.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
