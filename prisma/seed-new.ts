import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Delete all existing data
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.giftWrap.deleteMany()
  await prisma.occasion.deleteMany()
  await prisma.banner.deleteMany()

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@fnp.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+919999999999'
    }
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create Categories
  const categories = await Promise.all([
    // PRODUCT Categories
    prisma.category.create({
      data: {
        name: 'Flowers',
        emoji: '🌹',
        type: 'PRODUCT',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Cakes',
        emoji: '🎂',
        type: 'PRODUCT',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Personalized Gifts',
        emoji: '🎁',
        type: 'PRODUCT',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Soft Toys',
        emoji: '🧸',
        type: 'PRODUCT',
        isActive: true
      }
    }),
    // RECIPIENT Categories
    prisma.category.create({
      data: {
        name: 'For Him',
        emoji: '👨',
        type: 'RECIPIENT',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'For Her',
        emoji: '👩',
        type: 'RECIPIENT',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'For Kids',
        emoji: '👶',
        type: 'RECIPIENT',
        isActive: true
      }
    }),
    // OCCASION Categories
    prisma.category.create({
      data: {
        name: 'Birthday',
        emoji: '🎂',
        type: 'OCCASION',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Anniversary',
        emoji: '💑',
        type: 'OCCASION',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Wedding',
        emoji: '💒',
        type: 'OCCASION',
        isActive: true
      }
    }),
  ])
  console.log(`✅ Created ${categories.length} categories`)

  // Create Gift Wraps
  const giftWraps = await Promise.all([
    prisma.giftWrap.create({
      data: {
        name: 'Classic Red',
        description: 'Traditional red gift wrap with ribbon',
        price: 49,
        image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400',
        type: 'simple',
        isActive: true
      }
    }),
    prisma.giftWrap.create({
      data: {
        name: 'Premium Gold',
        description: 'Elegant gold foil wrapping',
        price: 99,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
        type: 'premium',
        isActive: true
      }
    }),
    prisma.giftWrap.create({
      data: {
        name: 'Floral Design',
        description: 'Beautiful floral pattern gift wrap',
        price: 69,
        image: 'https://images.unsplash.com/photo-1545252682-2a285b05b6eb?w=400',
        type: 'themed',
        isActive: true
      }
    }),
  ])
  console.log(`✅ Created ${giftWraps.length} gift wraps`)

  // Create Occasions
  const occasions = await Promise.all([
    prisma.occasion.create({
      data: {
        name: 'Birthday',
        emoji: '🎂',
        description: 'Celebrate special birthdays',
        icon: '🎂',
        isActive: true
      }
    }),
    prisma.occasion.create({
      data: {
        name: 'Anniversary',
        emoji: '💑',
        description: 'Celebrate love',
        icon: '💑',
        isActive: true
      }
    }),
    prisma.occasion.create({
      data: {
        name: "Valentine's Day",
        emoji: '❤️',
        description: 'Express your love',
        icon: '❤️',
        isActive: true
      }
    }),
    prisma.occasion.create({
      data: {
        name: "Mother's Day",
        emoji: '🌸',
        description: 'Honor your mother',
        icon: '🌸',
        isActive: true
      }
    }),
  ])
  console.log(`✅ Created ${occasions.length} occasions`)

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Red Rose Bouquet',
        description: 'Beautiful arrangement of 12 fresh red roses',
        category: 'Flowers',
        price: 899,
        image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400',
        isAvailable: true,
        isVeg: true,
        prepTime: 120,
        tags: ['Roses', 'Flowers', 'Popular'],
        discount: 10,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Chocolate Truffle Cake',
        description: 'Decadent chocolate cake perfect for celebrations',
        category: 'Cakes',
        price: 649,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        isAvailable: true,
        isVeg: true,
        prepTime: 180,
        tags: ['Cakes', 'Chocolate', 'Best Seller'],
        discount: 15,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Personalized Photo Frame',
        description: 'Custom photo frame with your special message',
        category: 'Personalized',
        price: 499,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
        isAvailable: true,
        isVeg: true,
        prepTime: 240,
        tags: ['Personalized', 'Gifts', 'Photo'],
        discount: 5,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Teddy Bear with Heart',
        description: 'Cute teddy bear holding a red heart',
        category: 'Soft Toys',
        price: 399,
        image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400',
        isAvailable: true,
        isVeg: true,
        prepTime: 60,
        tags: ['Soft Toys', 'Teddy', 'Popular'],
        discount: 20,
      }
    }),
  ])
  console.log(`✅ Created ${products.length} products`)

  // Create Banners
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Same Day Delivery',
        subtitle: 'Order now, deliver today!',
        image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
        link: '/products',
        order: 1,
        isActive: true
      }
    }),
    prisma.banner.create({
      data: {
        title: 'Express Your Love',
        subtitle: 'Perfect gifts for every occasion',
        image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
        link: '/categories/flowers',
        order: 2,
        isActive: true
      }
    }),
  ])
  console.log(`✅ Created ${banners.length} banners`)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
