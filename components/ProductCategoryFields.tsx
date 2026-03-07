'use client'

import type { ProductCategoryGroups, ProductCategoryOption } from '@/lib/product-categories'

type ProductCategoryFieldsProps = {
  categories: ProductCategoryGroups
  loading: boolean
  error?: string | null
  category: string
  customTags: string
  recipientSelections: string[]
  occasionSelections: string[]
  onCategoryChange: (value: string) => void
  onCustomTagsChange: (value: string) => void
  onRecipientSelectionsChange: (value: string[]) => void
  onOccasionSelectionsChange: (value: string[]) => void
  accent?: 'pink' | 'orange'
}

function toggleSelection(selectedValues: string[], value: string) {
  if (selectedValues.includes(value)) {
    return selectedValues.filter((entry) => entry !== value)
  }

  return [...selectedValues, value]
}

function ChoiceGroup({
  title,
  description,
  options,
  selections,
  onChange,
  accent,
  loading,
}: {
  title: string
  description: string
  options: ProductCategoryOption[]
  selections: string[]
  onChange: (value: string[]) => void
  accent: 'pink' | 'orange'
  loading: boolean
}) {
  const activeClassName =
    accent === 'orange'
      ? 'border-orange-200 bg-orange-50 text-orange-700'
      : 'border-pink-200 bg-pink-50 text-pink-700'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <p className="mb-3 text-xs text-gray-500">{description}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selections.includes(option.name)

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(toggleSelection(selections, option.name))}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                isSelected
                  ? activeClassName
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.name}
            </button>
          )
        })}
      </div>
      {!loading && options.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs text-gray-500">
          No categories configured yet.
        </p>
      )}
      {loading && options.length === 0 && (
        <p className="mt-3 text-xs text-gray-500">Loading categories...</p>
      )}
    </div>
  )
}

export default function ProductCategoryFields({
  categories,
  loading,
  error,
  category,
  customTags,
  recipientSelections,
  occasionSelections,
  onCategoryChange,
  onCustomTagsChange,
  onRecipientSelectionsChange,
  onOccasionSelectionsChange,
  accent = 'pink',
}: ProductCategoryFieldsProps) {
  const ringClassName = accent === 'orange' ? 'focus:ring-orange-500' : 'focus:ring-pink-500'
  const selectedCategoryMissing =
    Boolean(category) &&
    !categories.productCategories.some((option) => option.name === category)

  return (
    <div className="col-span-2 rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Category*</label>
          {!loading && categories.productCategories.length > 0 ? (
            <select
              required
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${ringClassName}`}
            >
              <option value="">Select a product category</option>
              {selectedCategoryMissing && <option value={category}>{category}</option>}
              {categories.productCategories.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${ringClassName}`}
              placeholder={loading ? 'Loading categories...' : 'Flowers'}
            />
          )}
          <p className="mt-1 text-xs text-gray-500">
            {error || 'Main catalog group such as Flowers, Cakes, or Addons.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Tags</label>
          <input
            type="text"
            value={customTags}
            onChange={(e) => onCustomTagsChange(e.target.value)}
            placeholder="romantic, premium, same day"
            className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 ${ringClassName}`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional extra search tags. Recipient and occasion selections are added automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChoiceGroup
          title="Recipient Categories"
          description="Show this product under recipient sections like Men, Women, or Kids."
          options={categories.recipientCategories}
          selections={recipientSelections}
          onChange={onRecipientSelectionsChange}
          accent={accent}
          loading={loading}
        />
        <ChoiceGroup
          title="Occasion Categories"
          description="Show this product under occasion sections like Birthday or Anniversary."
          options={categories.occasionCategories}
          selections={occasionSelections}
          onChange={onOccasionSelectionsChange}
          accent={accent}
          loading={loading}
        />
      </div>
    </div>
  )
}
