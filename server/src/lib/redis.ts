import { Redis } from 'ioredis'
import { Env } from './env'

export const redis = new Redis({
  host: Env.REDIS_HOST,
  port: Env.REDIS_PORT,
})
