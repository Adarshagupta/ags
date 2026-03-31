'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductCategoryFields from '@/components/ProductCategoryFields'
import ProductFoodTypeFields from '@/components/ProductFoodTypeFields'
import ImageDropUpload from '@/components/admin/ImageDropUpload'
import SubProductSelector from '@/components/admin/SubProductSelector'
import { uploadProductImage } from '@/lib/upload-image'
import {
  EMPTY_PRODUCT_CATEGORY_GROUPS,
  buildProductTags,
  fetchProductCategoryGroups,
  splitProductTags,
} from '@/lib/product-categories'
import { extractSubProductIdsFromTags, mergeSubProductTags, stripSubProductTags } from '@/lib/product-subproducts'
import { renderProductDescriptionMarkdown } from '@/lib/markdown-description'
import { formatPriceNoDecimals } from '@/lib/utils'

type ProductVariant = {
  color: string
  size: string
  image: string
  price?: number | ''
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [subProductIds, setSubProductIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    miniDescription: '',
    description: '',
    category: '',
    price: 0,
    image: '',
    images: [''],
    variants: [] as ProductVariant[],
    imageAlt: '',
    showFoodTypeLabel: false,
    isVeg: true,
    prepTime: 15,
    tags: '',
    discount: 0,
    isAvailable: true
  })

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

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
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

  const applyCakeQuickSetup = () => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category || 'Cakes',
      prepTime: prev.prepTime <= 0 ? 60 : prev.prepTime,
      tags: prev.tags ? `${prev.tags}, cake, birthday` : 'cake, birthday',
      variants:
        prev.variants.length > 0
          ? prev.variants
          : [
              { color: 'Chocolate', size: '1 Kg', image: '', price: prev.price || 0 },
              { color: 'Vanilla', size: '0.5 Kg', image: '', price: Math.max((prev.price || 0) * 0.65, 0) },
            ],
    }))
    if (variantFiles.length === 0) {
      setVariantFiles([null, null])
    }
  }

  useEffect(() => {
    void fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const [productResult, categoriesResult] = await Promise.allSettled([
        fetch(`/api/admin/products/${id}`),
        fetchProductCategoryGroups(),
      ])

      let nextCategoryGroups = EMPTY_PRODUCT_CATEGORY_GROUPS

      if (categoriesResult.status === 'fulfilled') {
        nextCategoryGroups = categoriesResult.value
        setCategoryGroups(categoriesResult.value)
        setCategoryError(null)
      } else {
        console.error('Failed to load product categories:', categoriesResult.reason)
        setCategoryError('Category options could not be loaded. You can still edit the main category manually.')
      }

      if (productResult.status === 'rejected') {
        throw productResult.reason
      }

      const res = productResult.value
      if (res.ok) {
        const product = await res.json()
        const variants = Array.isArray(product.variants)
          ? product.variants
              .map((variant: any) => ({
                color: String(variant?.color || ''),
                size: String(variant?.size || ''),
                image: String(variant?.image || ''),
                ...(Number.isFinite(Number(variant?.price)) ? { price: Number(variant.price) } : {}),
              }))
              .filter((variant: ProductVariant) => variant.image && (variant.color || variant.size))
          : []
        const plainTags = stripSubProductTags(product.tags)
        const tagState = splitProductTags(
          plainTags,
          nextCategoryGroups.recipientCategories,
          nextCategoryGroups.occasionCategories
        )

        setFormData({
          name: product.name,
          miniDescription: String(product.miniDescription || ''),
          description: product.description,
          category: product.category,
          price: product.price,
          image: product.image,
          images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
          variants,
          imageAlt: product.imageAlt || '',
          showFoodTypeLabel: Boolean(product.showFoodTypeLabel),
          isVeg: product.isVeg,
          prepTime: product.prepTime,
          tags: tagState.customTags,
          discount: product.discount || 0,
          isAvailable: product.isAvailable
        })
        setRecipientSelections(tagState.recipientSelections)
        setOccasionSelections(tagState.occasionSelections)
        setSubProductIds(extractSubProductIdsFromTags(product.tags))
        setVariantFiles(new Array(variants.length).fill(null))
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setCategoryGroupsLoading(false)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: mergeSubProductTags(
            buildProductTags(formData.tags, recipientSelections, occasionSelections),
            subProductIds
          ),
          images: formData.images.filter(img => img.trim()),
          showFoodTypeLabel: formData.showFoodTypeLabel,
          variants: formData.variants
            .map((variant) => ({
              color: variant.color.trim(),
              size: variant.size.trim(),
              image: variant.image.trim(),
              ...(Number.isFinite(Number(variant.price)) && Number(variant.price) >= 0
                ? { price: Number(variant.price) }
                : {}),
            }))
            .filter((variant) => variant.image && (variant.color || variant.size)),
        })
      })

      if (res.ok) {
        router.push('/admin/products')
      } else {
        alert('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
          <p className="text-sm font-medium text-orange-700">Use cake starter to quickly prepare cake-ready options.</p>
          <button
            type="button"
            onClick={applyCakeQuickSetup}
            className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
          >
            Apply Cake Starter
          </button>
        </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mini Description</label>
            <input
              type="text"
              value={formData.miniDescription}
              onChange={(e) => setFormData({ ...formData, miniDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Short one-line text shown above price"
            />
          </div>

          <div className="col-span-2 space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Markdown)*</label>
            <textarea
              required
              rows={7}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="# Product Highlights&#10;- Freshly baked&#10;- Same day delivery&#10;&#10;**Storage:** Keep refrigerated."
            />
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Preview</p>
              <div
                className="space-y-3 text-sm leading-7 text-gray-700 [&_a]:text-pink-600 [&_h1]:text-xl [&_h2]:text-lg"
                dangerouslySetInnerHTML={{ __html: renderProductDescriptionMarkdown(formData.description) }}
              />
            </div>
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

          <SubProductSelector value={subProductIds} onChange={setSubProductIds} excludeProductId={id} />

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
            <div className="mt-2 space-y-2">
              <ImageDropUpload
                label="Main product image"
                onFileSelect={setMainImageFile}
                disabled={uploadingMainImage}
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
              <ImageDropUpload
                label="Additional gallery image"
                onFileSelect={setAdditionalImageFile}
                disabled={uploadingAdditionalImage}
              />
              <button
                type="button"
                onClick={handleAdditionalImageUpload}
                disabled={!additionalImageFile || uploadingAdditionalImage}
                className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
              >
                {uploadingAdditionalImage ? 'Uploading...' : 'Upload and Add'}
              </button>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price ?? ''}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        'price',
                        e.target.value === '' ? '' : String(Math.max(0, Number(e.target.value)))
                      )
                    }
                    placeholder="Variant Price"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <ImageDropUpload
                      label={`Variant ${index + 1} image`}
                      onFileSelect={(file) =>
                        setVariantFiles((prev) => {
                          const nextFiles = [...prev]
                          nextFiles[index] = file
                          return nextFiles
                        })
                      }
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
                {typeof variant.price === 'number' ? (
                  <p className="mt-2 text-xs font-semibold text-orange-600">Selling at {formatPriceNoDecimals(variant.price)}</p>
                ) : null}
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

          <div className="col-span-2 space-y-4">
            <ProductFoodTypeFields
              showFoodTypeLabel={formData.showFoodTypeLabel}
              isVeg={formData.isVeg}
              accent="orange"
              onShowFoodTypeLabelChange={(value) => setFormData({ ...formData, showFoodTypeLabel: value })}
              onIsVegChange={(value) => setFormData({ ...formData, isVeg: value })}
            />
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
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
