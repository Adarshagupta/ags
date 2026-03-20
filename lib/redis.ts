type RedisClient = {
  publish: (channel: string, message: string) => Promise<number>
  on: (event: 'error', listener: (error: Error) => void) => void
}

const globalForRedis = globalThis as unknown as {
  redisPromise: Promise<RedisClient | null> | undefined
}

async function createRedisClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    return null
  }

  const { default: Redis } = await import('ioredis')
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis connection failed after 3 retries')
        return null
      }

      return Math.min(times * 100, 3000)
    },
    lazyConnect: true,
  }) as RedisClient

  client.on('error', (error) => {
    console.warn('Redis connection error:', error.message)
  })

  return client
}

function getRedisClient() {
  if (!globalForRedis.redisPromise) {
    globalForRedis.redisPromise = createRedisClient().catch((error) => {
      console.warn('Redis client setup failed:', error)
      return null
    })
  }

  return globalForRedis.redisPromise
}

export const redis = {
  async publish(channel: string, message: string) {
    try {
      const client = await getRedisClient()

      if (!client) {
        return 0
      }

      return await client.publish(channel, message)
    } catch (error) {
      console.warn('Redis publish failed:', error)
      return 0
    }
  },
}

export const REDIS_KEYS = {
  CART: (userId: string) => `cart:${userId}`,
  ORDER_STATUS: (orderId: string) => `order:${orderId}:status`,
  DELIVERY_LOCATION: (partnerId: string) => `delivery:${partnerId}:location`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  RATE_LIMIT: (ip: string) => `ratelimit:${ip}`
}

export const REDIS_CHANNELS = {
  ORDER_UPDATES: 'order:updates',
  DELIVERY_LOCATION: 'delivery:location'
}
