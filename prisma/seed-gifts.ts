import { prisma } from '../lib/prisma'

const GIFT_WRAPS = [
  {
    name: 'Premium Gold',
    description: 'Luxurious gold wrapping with ribbon',
    price: 50,
    image: '🎁',
    type: 'premium',
  },
  {
    name: 'Eco-Friendly Green',
    description: 'Sustainable kraft paper wrapping',
    price: 30,
    image: '🌿',
    type: 'eco-friendly',
  },
  {
    name: 'Birthday Theme',
    description: 'Colorful birthday themed wrapping',
    price: 40,
    image: '🎉',
    type: 'themed',
  },
  {
    name: 'Red Romance',
    description: 'Red velvet wrapping with bow',
    price: 45,
    image: '❤️',
    type: 'premium',
  },
  {
    name: 'Simple Brown',
    description: 'Basic brown paper wrapping',
    price: 20,
    image: '📦',
    type: 'simple',
  },
]

const OCCASIONS = [
  {
    name: 'Birthday',
    emoji: '🎂',
    description: 'Celebrate their special day',
    icon: '🎂',
  },
  {
    name: 'Anniversary',
    emoji: '💑',
    description: 'Celebrate your love and togetherness',
    icon: '💑',
  },
  {
    name: 'Wedding',
    emoji: '💍',
    description: 'Celebrate the new beginning',
    icon: '💍',
  },
  {
    name: 'Get Well Soon',
    emoji: '💝',
    description: 'Send healing wishes',
    icon: '💝',
  },
  {
    name: 'Congratulations',
    emoji: '🎊',
    description: 'Celebrate their achievement',
    icon: '🎊',
  },
  {
    name: 'Thank You',
    emoji: '🙏',
    description: 'Express your gratitude',
    icon: '🙏',
  },
  {
    name: 'Love & Care',
    emoji: '💕',
    description: 'Show how much you care',
    icon: '💕',
  },
  {
    name: 'New Baby',
    emoji: '👶',
    description: 'Welcome the new arrival',
    icon: '👶',
  },
  {
    name: 'Friendship',
    emoji: '👯',
    description: 'Celebrate your friendship',
    icon: '👯',
  },
  {
    name: 'Just Because',
    emoji: '✨',
    description: 'No reason, just because',
    icon: '✨',
  },
]

async function main() {
  console.log('Seeding gift data...')

  // Seed Gift Wraps
  for (const wrap of GIFT_WRAPS) {
    await prisma.giftWrap.upsert({
      where: { name: wrap.name },
      update: {},
      create: wrap,
    })
  }

  console.log(`✅ Seeded ${GIFT_WRAPS.length} gift wraps`)

  // Seed Occasions
  for (const occasion of OCCASIONS) {
    await prisma.occasion.upsert({
      where: { name: occasion.name },
      update: {},
      create: occasion,
    })
  }

  console.log(`✅ Seeded ${OCCASIONS.length} occasions`)
  console.log('🎁 Gift data seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
