import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const LEGACY_PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  category: true,
  price: true,
  image: true,
  images: true,
  variants: true,
  imageAlt: true,
  isAvailable: true,
  isVeg: true,
  prepTime: true,
  tags: true,
  discount: true,
  sellerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect

type LegacyProductShape = Prisma.ProductGetPayload<{ select: typeof LEGACY_PRODUCT_SELECT }>
export type ProductCompatResult = LegacyProductShape & { showFoodTypeLabel: boolean }

export function isMissingAppSettingsTableError(error: unknown) {
  const code = (error as { code?: string } | null)?.code
  const message = String((error as { message?: string } | null)?.message || '')

  return code === 'P2021' && message.includes('AppSettings')
}

export function isMissingProductFoodTypeColumnError(error: unknown) {
  const code = (error as { code?: string } | null)?.code
  const message = String((error as { message?: string } | null)?.message || '')

  return (
    (code === 'P2022' && message.includes('showFoodTypeLabel')) ||
    message.includes('The column `(not available)` does not exist in the current database')
  )
}

export function withProductCompatibility<T extends Record<string, unknown>>(product: T): T & { showFoodTypeLabel: boolean } {
  const value = (product as { showFoodTypeLabel?: boolean | null }).showFoodTypeLabel

  return {
    ...product,
    showFoodTypeLabel: Boolean(value),
  }
}

export function stripFoodTypeLabelField<T extends Record<string, unknown>>(data: T) {
  const { showFoodTypeLabel: _showFoodTypeLabel, ...rest } = data
  return rest
}

export async function findManyProductsCompat(
  args: Omit<Prisma.ProductFindManyArgs, 'select'>
): Promise<ProductCompatResult[]> {
  try {
    const products = await prisma.product.findMany(args)
    return products.map((product) => withProductCompatibility(product)) as ProductCompatResult[]
  } catch (error) {
    if (!isMissingProductFoodTypeColumnError(error)) {
      throw error
    }

    const products = await prisma.product.findMany({
      ...args,
      select: LEGACY_PRODUCT_SELECT,
    })

    return products.map((product) => withProductCompatibility(product)) as ProductCompatResult[]
  }
}

export async function findFirstProductCompat(
  args: Omit<Prisma.ProductFindFirstArgs, 'select'>
): Promise<ProductCompatResult | null> {
  try {
    const product = await prisma.product.findFirst(args)
    return product ? (withProductCompatibility(product) as ProductCompatResult) : null
  } catch (error) {
    if (!isMissingProductFoodTypeColumnError(error)) {
      throw error
    }

    const product = await prisma.product.findFirst({
      ...args,
      select: LEGACY_PRODUCT_SELECT,
    })

    return product ? (withProductCompatibility(product) as ProductCompatResult) : null
  }
}
