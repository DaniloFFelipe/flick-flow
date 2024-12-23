import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { StatusCodes } from 'http-status-codes'
import { Env } from '@/src/lib/env'

declare module 'fastify' {
  export interface FastifyRequest {}
}

export const assets = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('onRequest', async (request, reply) => {
    const key = request.headers['x-api-key'] as string | undefined
    if (!key || Env.ASSETS_KEY !== key) {
      return reply
        .status(StatusCodes.FORBIDDEN)
        .send({ message: 'Invalid API key' })
    }
  })
})
