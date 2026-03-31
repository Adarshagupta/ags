export const RECOMMENDATION_KINDS = ['RELATED', 'ADDON', 'COMBO'] as const
export const RECOMMENDATION_SCOPE_TYPES = ['PRODUCT', 'CATEGORY'] as const

export type RecommendationKind = (typeof RECOMMENDATION_KINDS)[number]
export type RecommendationKindValue = RecommendationKind
export type RecommendationScopeType = (typeof RECOMMENDATION_SCOPE_TYPES)[number]
export type RecommendationScopeTypeValue = RecommendationScopeType

export type RecommendationRuleInputMap = Record<RecommendationKind, string[]>

export type RecommendationProduct = {
  id: string
  name: string
  price: number
  image: string
  category: string
  discount: number
  isVeg: boolean
  isAvailable: boolean
}

export type RecommendationRuleWithProducts = {
  kind: RecommendationKind
  position: number
  targetProductId: string
  targetProduct: RecommendationProduct
}

export const EMPTY_RECOMMENDATION_RULES: RecommendationRuleInputMap = {
  RELATED: [],
  ADDON: [],
  COMBO: [],
}

export const RECOMMENDATION_LIMITS: Record<RecommendationKind, number> = {
  RELATED: 8,
  ADDON: 6,
  COMBO: 3,
}

export type RecommendationSectionResponse = {
  buyTogether: RecommendationProduct[]
  addons: RecommendationProduct[]
  related: RecommendationProduct[]
}

export type RecommendationSectionKey = keyof RecommendationSectionResponse

export const RECOMMENDATION_SECTION_META: Array<{
  key: RecommendationSectionKey
  kind: RecommendationKind
  title: string
  description: string
}> = [
  {
    key: 'buyTogether',
    kind: 'COMBO',
    title: 'Buy Together',
    description: 'Quick multi-add companions for the current moment.',
  },
  {
    key: 'addons',
    kind: 'ADDON',
    title: 'Add-ons',
    description: 'Complementary extras that pair well with the anchor item.',
  },
  {
    key: 'related',
    kind: 'RELATED',
    title: 'Related for You',
    description: 'Similar products based on rules, behavior, and merchandising tags.',
  },
]

export const MERCH_TAG_OPTIONS = [
  'cake',
  'candle',
  'popper',
  'topper',
  'knife',
  'greeting-card',
  'balloon',
  'chocolate',
  'flower-addon',
  'gift-hamper',
  'soft-toy',
] as const

const MERCH_TAG_SET = new Set<string>(MERCH_TAG_OPTIONS)

export type MerchandisingTag = (typeof MERCH_TAG_OPTIONS)[number]

export function normalizeRecommendationTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

export function isMerchandisingTag(tag: string) {
  return MERCH_TAG_SET.has(normalizeRecommendationTag(tag))
}

export function splitMerchandisingTags(input: string[] | null | undefined) {
  const merchandisingTags: string[] = []
  const customTags: string[] = []
  const seenMerchTags = new Set<string>()
  const seenCustomTags = new Set<string>()

  for (const rawTag of Array.isArray(input) ? input : []) {
    const normalizedTag = normalizeRecommendationTag(String(rawTag || ''))
    if (!normalizedTag) {
      continue
    }

    if (MERCH_TAG_SET.has(normalizedTag)) {
      if (!seenMerchTags.has(normalizedTag)) {
        merchandisingTags.push(normalizedTag)
        seenMerchTags.add(normalizedTag)
      }
      continue
    }

    if (!seenCustomTags.has(normalizedTag)) {
      customTags.push(normalizedTag)
      seenCustomTags.add(normalizedTag)
    }
  }

  return {
    merchandisingTags,
    customTags,
  }
}
