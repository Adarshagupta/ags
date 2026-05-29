'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  image: string
  type: 'PRODUCT' | 'RECIPIENT' | 'OCCASION'
  parentId: string | null
  isActive: boolean
}

const CATEGORY_TYPES = ['PRODUCT', 'RECIPIENT', 'OCCASION']

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    type: 'PRODUCT' as 'PRODUCT' | 'RECIPIENT' | 'OCCASION',
    parentId: '',
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null
        })
      })

      if (res.ok) {
        fetchCategories()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const editCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: category.image,
      type: category.type,
      parentId: category.parentId || '',
      isActive: category.isActive
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', image: '', type: 'PRODUCT', parentId: '', isActive: true })
    setEditingCategory(null)
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
          <p className="text-ink/55 mt-1">Manage product, recipient & occasion categories</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-wine hover:bg-wine-deep text-white px-6 py-2.5 rounded-full font-semibold"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-[22px] border border-wine/10 p-6 mb-6">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Name*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Type*</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                >
                  {CATEGORY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Parent Category</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-2 border border-wine/15 rounded-xl bg-white text-ink focus:outline-none focus:ring-2 focus:ring-wine/15 focus:border-wine/40"
                >
                  <option value="">None</option>
                  {categories.filter(c => c.type === formData.type && c.id !== editingCategory?.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
              <button type="button" onClick={resetForm} className="border border-wine/20 bg-white hover:bg-cream text-wine px-6 py-2 rounded-full font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-6">
        {CATEGORY_TYPES.map(type => (
          <div key={type}>
            <h2 className="font-display text-xl font-semibold mb-3 text-ink">{type} Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.filter(cat => cat.type === type).map(category => (
                <div key={category.id} className="bg-white rounded-[22px] border border-wine/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-cream-deep rounded-xl overflow-hidden flex-shrink-0">
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-ink">{category.name}</h3>
                    </div>
                    {category.isActive && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editCategory(category)} className="text-wine hover:text-wine-deep text-sm font-semibold">
                      Edit
                    </button>
                    <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
