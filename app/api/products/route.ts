import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ARCHIVED_PRODUCT_TAG, sanitizeProductTags } from '@/lib/product-archive'
import { findManyProductsCompat, isMissingProductFoodTypeColumnError, stripFoodTypeLabelField } from '@/lib/product-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const where: any = {
      isAvailable: true,
      NOT: {
        tags: {
          has: ARCHIVED_PRODUCT_TAG,
        },
      },
    }

    if (categoryId) {
      const selectedCategory = await prisma.category.findFirst({
        where: {
          id: categoryId,
          isActive: true,
        },
        select: {
          name: true,
          type: true,
        },
      })

      if (!selectedCategory) {
        return NextResponse.json(
          { products: [] },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
            },
          }
        )
      }

      if (selectedCategory.type === 'PRODUCT') {
        where.category = selectedCategory.name
      } else {
        where.tags = {
          has: selectedCategory.name,
        }
      }
    } else if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await findManyProductsCompat({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, price, image, isVeg, showFoodTypeLabel, prepTime, tags, discount } = body

    const data = {
      name,
      description,
      category,
      price,
      image,
      imageAlt: name,
      showFoodTypeLabel: showFoodTypeLabel === true,
      isVeg,
      prepTime: prepTime || 15,
      tags: sanitizeProductTags(tags),
      discount: discount || 0,
    }

    let product

    try {
      product = await prisma.product.create({ data })
    } catch (error) {
      if (!isMissingProductFoodTypeColumnError(error)) {
        throw error
      }

      product = await prisma.product.create({
        data: stripFoodTypeLabelField(data),
      })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
