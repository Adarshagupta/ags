'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  order: number
  isActive: boolean
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners'
      const method = editingBanner ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchBanners()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving banner:', error)
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      if (res.ok) fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      order: banner.order,
      isActive: banner.isActive
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image: '', link: '', order: 0, isActive: true })
    setEditingBanner(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Banners</h1>
          <p className="text-ink/55 mt-1">Manage homepage banners</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-wine hover:bg-wine-deep text-white px-6 py-2.5 rounded-full font-semibold"
        >
          {showForm ? 'Cancel' : '+ Add Banner'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-[22px] border border-wine/10 p-6 mb-6">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Title*</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Image URL*</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Link</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-wine border-wine/30 rounded focus:ring-wine/30"
                  />
                  <span className="text-sm font-medium text-ink/70">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-wine hover:bg-wine-deep text-white px-6 py-2 rounded-full font-semibold">
                {editingBanner ? 'Update' : 'Create'} Banner
              </button>
              <button type="button" onClick={resetForm} className="border border-wine/20 bg-white hover:bg-cream text-wine px-6 py-2 rounded-full font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-ink/55">Loading...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-ink/55">No banners yet</div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-[22px] border border-wine/10 overflow-hidden">
              <div className="relative h-36">
                <Image unoptimized src={banner.image} alt={banner.title} fill className="object-cover" />
                {banner.isActive && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-lg text-ink">{banner.title}</h3>
                {banner.subtitle && <p className="text-ink/55 text-sm">{banner.subtitle}</p>}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-ink/55">Order: {banner.order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => editBanner(banner)} className="text-wine hover:text-wine-deep text-sm font-semibold">
                      Edit
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

