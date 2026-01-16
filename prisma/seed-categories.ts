import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burgers', emoji: '🍔' },
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'North Indian', emoji: '🍲' },
  { name: 'South Indian', emoji: '🥘' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Beverages', emoji: '🥤' },
  { name: 'Starters', emoji: '🍢' },
  { name: 'Rolls', emoji: '🌯' },
  { name: 'Sandwiches', emoji: '🥪' },
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Salads', emoji: '🥗' },
  { name: 'Ice Cream', emoji: '🍦' },
]

async function main() {
  console.log('Seeding categories...')

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log(`✅ Seeded ${categories.length} categories`)
  console.log('🎉 Categories seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
