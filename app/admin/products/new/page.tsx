'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductCategoryFields from '@/components/ProductCategoryFields'
import { uploadProductImage } from '@/lib/upload-image'
import {
  EMPTY_PRODUCT_CATEGORY_GROUPS,
  buildProductTags,
  fetchProductCategoryGroups,
} from '@/lib/product-categories'

type ProductVariant = {
  color: string
  size: string
  image: string
}

export default function NewProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFile, setAdditionalImageFile] = useState<File | null>(null)
  const [variantFiles, setVariantFiles] = useState<Array<File | null>>([])
  const [uploadingMainImage, setUploadingMainImage] = useState(false)
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false)
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null)
  const [categoryGroups, setCategoryGroups] = useState(EMPTY_PRODUCT_CATEGORY_GROUPS)
  const [categoryGroupsLoading, setCategoryGroupsLoading] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [recipientSelections, setRecipientSelections] = useState<string[]>([])
  const [occasionSelections, setOccasionSelections] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    image: '',
    images: [''],
    variants: [] as ProductVariant[],
    imageAlt: '',
    isVeg: true,
    prepTime: 15,
    tags: '',
    discount: 0,
    isAvailable: true
  })

  useEffect(() => {
    void loadCategoryGroups()
  }, [])

  const loadCategoryGroups = async () => {
    try {
      const categories = await fetchProductCategoryGroups()
      setCategoryGroups(categories)
      setCategoryError(null)
    } catch (error) {
      console.error('Failed to load product categories:', error)
      setCategoryError('Category options could not be loaded. You can still type the main category manually.')
    } finally {
      setCategoryGroupsLoading(false)
    }
  }

  const setAdditionalImageUrl = (url: string) => {
    setFormData((prev) => {
      const firstEmptyIndex = prev.images.findIndex((img) => !img.trim())
      if (firstEmptyIndex >= 0) {
        const nextImages = [...prev.images]
        nextImages[firstEmptyIndex] = url
        return { ...prev, images: nextImages }
      }

      return { ...prev, images: [...prev.images, url] }
    })
  }

  const handleMainImageUpload = async () => {
    if (!mainImageFile) {
      alert('Please choose an image file first')
      return
    }

    try {
      setUploadingMainImage(true)
      const url = await uploadProductImage(mainImageFile)
      setFormData((prev) => ({ ...prev, image: url }))
      setMainImageFile(null)
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image')
    } finally {
      setUploadingMainImage(false)
    }
  }

  const handleAdditionalImageUpload = async () => {
    if (!additionalImageFile) {
      alert('Please choose an image file first')
      return
    }

    try {
      setUploadingAdditionalImage(true)
      const url = await uploadProductImage(additionalImageFile)
      setAdditionalImageUrl(url)
      setAdditionalImageFile(null)
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image')
    } finally {
      setUploadingAdditionalImage(false)
    }
  }

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { color: '', size: '', image: '' }],
    }))
    setVariantFiles((prev) => [...prev, null])
  }

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
    setVariantFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    setFormData((prev) => {
      const nextVariants = [...prev.variants]
      nextVariants[index] = { ...nextVariants[index], [field]: value }
      return { ...prev, variants: nextVariants }
    })
  }

  const uploadVariantImage = async (index: number) => {
    const file = variantFiles[index]
    if (!file) {
      alert('Please choose a variant image file first')
      return
    }

    try {
      setUploadingVariantIndex(index)
      const url = await uploadProductImage(file)
      updateVariant(index, 'image', url)
      setVariantFiles((prev) => {
        const nextFiles = [...prev]
        nextFiles[index] = null
        return nextFiles
      })
    } catch (error: any) {
      alert(error?.message || 'Failed to upload variant image')
    } finally {
      setUploadingVariantIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: buildProductTags(formData.tags, recipientSelections, occasionSelections),
          images: formData.images.filter(img => img.trim()),
          variants: formData.variants
            .map((variant) => ({
              color: variant.color.trim(),
              size: variant.size.trim(),
              image: variant.image.trim(),
            }))
            .filter((variant) => variant.image && (variant.color || variant.size)),
        })
      })

      if (res.ok) {
        router.push('/admin/products')
      } else {
        alert('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <ProductCategoryFields
            categories={categoryGroups}
            loading={categoryGroupsLoading}
            error={categoryError}
            category={formData.category}
            customTags={formData.tags}
            recipientSelections={recipientSelections}
            occasionSelections={occasionSelections}
            onCategoryChange={(value) => setFormData({ ...formData, category: value })}
            onCustomTagsChange={(value) => setFormData({ ...formData, tags: value })}
            onRecipientSelectionsChange={setRecipientSelections}
            onOccasionSelectionsChange={setOccasionSelections}
            accent="orange"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)*</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL*</label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 sm:w-auto"
              />
              <button
                type="button"
                onClick={handleMainImageUpload}
                disabled={!mainImageFile || uploadingMainImage}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
              >
                {uploadingMainImage ? 'Uploading...' : 'Upload Main Image'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP or GIF. Max size 5MB.</p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
            {formData.images.map((img, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => {
                    const newImages = [...formData.images]
                    newImages[index] = e.target.value
                    setFormData({ ...formData, images: newImages })
                  }}
                  placeholder={`Image ${index + 1} URL`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index)
                    setFormData({ ...formData, images: newImages })
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium"
            >
              + Add Another Image
            </button>
            <div className="mt-3 rounded-lg border border-dashed border-gray-300 p-3">
              <p className="text-xs text-gray-600">Upload additional image</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setAdditionalImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 sm:w-auto"
                />
                <button
                  type="button"
                  onClick={handleAdditionalImageUpload}
                  disabled={!additionalImageFile || uploadingAdditionalImage}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
                >
                  {uploadingAdditionalImage ? 'Uploading...' : 'Upload and Add'}
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Product Variants</label>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200"
              >
                + Add Variant
              </button>
            </div>
            {formData.variants.length === 0 && (
              <p className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg p-3">
                Add color or size variants and upload a specific image for each variant.
              </p>
            )}
            {formData.variants.map((variant, index) => (
              <div key={index} className="mb-3 rounded-lg border border-gray-200 p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    placeholder="Color (e.g., Red)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    placeholder="Size (e.g., Large)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={variant.image}
                    onChange={(e) => updateVariant(index, 'image', e.target.value)}
                    placeholder="Variant Image URL"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setVariantFiles((prev) => {
                          const nextFiles = [...prev]
                          nextFiles[index] = file
                          return nextFiles
                        })
                      }}
                      className="block w-full text-xs text-gray-700 sm:w-auto"
                    />
                    <button
                      type="button"
                      onClick={() => uploadVariantImage(index)}
                      disabled={!variantFiles[index] || uploadingVariantIndex === index}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black disabled:opacity-50"
                    >
                      {uploadingVariantIndex === index ? 'Uploading...' : 'Upload Variant Image'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 self-start"
                  >
                    Remove Variant
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
            <input
              type="text"
              value={formData.imageAlt}
              onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)*</label>
            <input
              type="number"
              required
              value={formData.prepTime}
              onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link
            href="/admin/products"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
