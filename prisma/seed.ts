import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
    category: 'Pizza',
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    isVeg: true,
    prepTime: 20,
    tags: ['Italian', 'Cheese', 'Popular'],
    discount: 10,
  },
  {
    name: 'Chicken Burger',
    description: 'Juicy grilled chicken patty with lettuce, tomato, and special sauce',
    category: 'Burgers',
    price: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isVeg: false,
    prepTime: 15,
    tags: ['Fast Food', 'Popular'],
    discount: 0,
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with mixed vegetables and aromatic spices',
    category: 'Biryani',
    price: 249,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    isVeg: true,
    prepTime: 25,
    tags: ['Indian', 'Rice', 'Spicy'],
    discount: 15,
  },
  {
    name: 'Chicken Biryani',
    description: 'Traditional Hyderabadi biryani with tender chicken pieces',
    category: 'Biryani',
    price: 329,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    isVeg: false,
    prepTime: 30,
    tags: ['Indian', 'Rice', 'Spicy', 'Popular'],
    discount: 20,
  },
  {
    name: 'Hakka Noodles',
    description: 'Stir-fried noodles with vegetables and soy sauce',
    category: 'Chinese',
    price: 179,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
    isVeg: true,
    prepTime: 15,
    tags: ['Chinese', 'Noodles'],
    discount: 0,
  },
  {
    name: 'Paneer Tikka Pizza',
    description: 'Fusion pizza with paneer tikka, onions, and bell peppers',
    category: 'Pizza',
    price: 349,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    isVeg: true,
    prepTime: 20,
    tags: ['Fusion', 'Indian', 'Cheese'],
    discount: 10,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich, fudgy chocolate brownie with ice cream',
    category: 'Desserts',
    price: 149,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
    isVeg: true,
    prepTime: 10,
    tags: ['Sweet', 'Chocolate'],
    discount: 0,
  },
  {
    name: 'Mango Shake',
    description: 'Creamy mango shake made with fresh mangoes',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
    isVeg: true,
    prepTime: 5,
    tags: ['Cold Drink', 'Fresh'],
    discount: 0,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni pizza with mozzarella and tomato sauce',
    category: 'Pizza',
    price: 379,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    isVeg: false,
    prepTime: 20,
    tags: ['Italian', 'Meat', 'Popular'],
    discount: 15,
  },
  {
    name: 'Veg Burger',
    description: 'Crispy vegetable patty with cheese and fresh vegetables',
    category: 'Burgers',
    price: 149,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    isVeg: true,
    prepTime: 12,
    tags: ['Fast Food', 'Healthy'],
    discount: 0,
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Delete existing admin user and recreate
  await prisma.user.deleteMany({
    where: { email: 'admin@fnp.com' }
  })

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

  // Clear existing products
  await prisma.product.deleteMany()
  console.log('✅ Cleared existing products')

  // Create sample products
  for (const product of sampleProducts) {
    await prisma.product.create({ data: product })
  }

  console.log(`✅ Created ${sampleProducts.length} products`)
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
