'use client'

type FoodTypeBadgeProps = {
  isVeg: boolean
  className?: string
}

export default function FoodTypeBadge({ isVeg, className = '' }: FoodTypeBadgeProps) {
  return (
    <div
      className={`flex h-4 w-4 items-center justify-center rounded-sm border bg-white ${
        isVeg ? 'border-green-600' : 'border-red-500'
      } ${className}`.trim()}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <div className={`h-2 w-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-500'}`} />
    </div>
  )
}
