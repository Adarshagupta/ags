'use client'

type ProductFoodTypeFieldsProps = {
  showFoodTypeLabel: boolean
  isVeg: boolean
  accent?: 'pink' | 'orange'
  onShowFoodTypeLabelChange: (value: boolean) => void
  onIsVegChange: (value: boolean) => void
}

export default function ProductFoodTypeFields({
  showFoodTypeLabel,
  isVeg,
  accent = 'pink',
  onShowFoodTypeLabelChange,
  onIsVegChange,
}: ProductFoodTypeFieldsProps) {
  const activeClassName =
    accent === 'orange'
      ? 'border-orange-500 bg-orange-50 text-orange-700'
      : 'border-pink-500 bg-pink-50 text-pink-700'

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showFoodTypeLabel}
          onChange={(e) => onShowFoodTypeLabelChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">Show veg / non-veg badge for this product</span>
      </label>

      {showFoodTypeLabel && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onIsVegChange(true)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isVeg ? activeClassName : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Vegetarian
          </button>
          <button
            type="button"
            onClick={() => onIsVegChange(false)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              !isVeg ? activeClassName : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Non-Vegetarian
          </button>
        </div>
      )}
    </div>
  )
}
