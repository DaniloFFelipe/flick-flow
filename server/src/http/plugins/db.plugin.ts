import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'

declare module 'fastify' {
  export interface FastifyRequest {
    prisma: PrismaClient
  }
}

export const database = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.prisma = prisma
  })
})
