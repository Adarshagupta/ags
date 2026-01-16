import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

// Create Redis client with error handling
const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis connection failed after 3 retries')
        return null // Stop retrying
      }
      return Math.min(times * 100, 3000)
    },
    lazyConnect: true,
  })
  
  client.on('error', (err) => {
    console.warn('Redis connection error:', err.message)
  })
  
  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Redis keys
export const REDIS_KEYS = {
  CART: (userId: string) => `cart:${userId}`,
  ORDER_STATUS: (orderId: string) => `order:${orderId}:status`,
  DELIVERY_LOCATION: (partnerId: string) => `delivery:${partnerId}:location`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  RATE_LIMIT: (ip: string) => `ratelimit:${ip}`
}

// Pub/Sub channels
export const REDIS_CHANNELS = {
  ORDER_UPDATES: 'order:updates',
  DELIVERY_LOCATION: 'delivery:location'
}
