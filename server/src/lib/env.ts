import z from 'zod'

const schema = z.object({
  JWT_SECRET: z.string(),
  ASSETS_KEY: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_ENDPOINT: z.string(),
  AWS_BUCKET: z.string().default('flowflick'),
  AWS_REGION: z.string().default('west-2'),

  STREAM_CND_BASE_URL: z.string(),
})

export const Env = schema.parse(process.env)
