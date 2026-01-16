import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding categories...')

  // Delete existing categories
  await prisma.category.deleteMany({})

  // Product Categories (Main gift types)
  const productCategories = [
    { name: 'Flowers', emoji: '💐', type: 'PRODUCT' as const },
    { name: 'Cakes', emoji: '🎂', type: 'PRODUCT' as const },
    { name: 'Chocolates', emoji: '🍫', type: 'PRODUCT' as const },
    { name: 'Personalized', emoji: '🎨', type: 'PRODUCT' as const },
    { name: 'Jewelry', emoji: '💍', type: 'PRODUCT' as const },
    { name: 'Soft Toys', emoji: '🧸', type: 'PRODUCT' as const },
    { name: 'Plants', emoji: '🪴', type: 'PRODUCT' as const },
    { name: 'Combos', emoji: '🎁', type: 'PRODUCT' as const },
    { name: 'Hampers', emoji: '🧺', type: 'PRODUCT' as const },
    { name: 'Home Decor', emoji: '🏠', type: 'PRODUCT' as const },
    { name: 'Fashion', emoji: '👗', type: 'PRODUCT' as const },
    { name: 'Gadgets', emoji: '📱', type: 'PRODUCT' as const },
  ]

  // Recipient Categories (For whom)
  const recipientCategories = [
    { name: 'For Him', emoji: '👨', type: 'RECIPIENT' as const },
    { name: 'For Her', emoji: '👩', type: 'RECIPIENT' as const },
    { name: 'For Kids', emoji: '👶', type: 'RECIPIENT' as const },
    { name: 'For Parents', emoji: '👴', type: 'RECIPIENT' as const },
    { name: 'For Friends', emoji: '🤝', type: 'RECIPIENT' as const },
    { name: 'For Couples', emoji: '💑', type: 'RECIPIENT' as const },
  ]

  // Occasion Categories
  const occasionCategories = [
    { name: 'Birthday', emoji: '🎂', type: 'OCCASION' as const },
    { name: 'Anniversary', emoji: '💕', type: 'OCCASION' as const },
    { name: 'Wedding', emoji: '💒', type: 'OCCASION' as const },
    { name: 'Valentine', emoji: '💝', type: 'OCCASION' as const },
    { name: 'Mother\'s Day', emoji: '🌷', type: 'OCCASION' as const },
    { name: 'Father\'s Day', emoji: '👔', type: 'OCCASION' as const },
    { name: 'Raksha Bandhan', emoji: '🪢', type: 'OCCASION' as const },
    { name: 'Diwali', emoji: '🪔', type: 'OCCASION' as const },
    { name: 'Christmas', emoji: '🎄', type: 'OCCASION' as const },
    { name: 'New Year', emoji: '🎊', type: 'OCCASION' as const },
    { name: 'Congratulations', emoji: '🎉', type: 'OCCASION' as const },
    { name: 'Get Well Soon', emoji: '🌻', type: 'OCCASION' as const },
    { name: 'Thank You', emoji: '🙏', type: 'OCCASION' as const },
    { name: 'Sorry', emoji: '🥺', type: 'OCCASION' as const },
  ]

  // Create all categories
  console.log('Creating product categories...')
  for (const category of productCategories) {
    await prisma.category.create({
      data: category,
    })
  }

  console.log('Creating recipient categories...')
  for (const category of recipientCategories) {
    await prisma.category.create({
      data: category,
    })
  }

  console.log('Creating occasion categories...')
  for (const category of occasionCategories) {
    await prisma.category.create({
      data: category,
    })
  }

  const totalCount = await prisma.category.count()
  console.log(`✅ Seeded ${totalCount} categories:`)
  console.log(`   - ${productCategories.length} product categories`)
  console.log(`   - ${recipientCategories.length} recipient categories`)
  console.log(`   - ${occasionCategories.length} occasion categories`)
  console.log('🎉 Categories seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
