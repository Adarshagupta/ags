import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return new PrismaClient()
  }

  // In local `next dev`, the pg adapter pool can survive hot reloads in a bad state
  // and keep returning P1017 until the server is restarted. Use the standard Prisma
  // engine in development and keep the adapter for production runtimes.
  if (process.env.NODE_ENV !== 'production') {
    return new PrismaClient()
  }

  const adapter = new PrismaPg(
    {
      connectionString,
    },
    {
      onPoolError: (error) => {
        console.warn('Postgres pool error:', error.message)
      },
    }
  )

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
