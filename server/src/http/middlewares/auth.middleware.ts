import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { TokensService } from '@/src/core/services/tokens.service'
import { AppError } from '../errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { Me } from '@/src/core/use-cases/users/me'
import { User } from '@/src/core/models/user.model'

declare module 'fastify' {
  export interface FastifyRequest {
    getUserId(): Promise<string>
    getUser(): Promise<User>

    tokensService: TokensService
  }
}

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request, reply) => {
    request.getUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token')
      }
    }

    request.getUser = async () => {
      const userId = await request.getUserId()
      try {
        const me = new Me(request.prisma)
        const [user, err] = await me.call({ user_id: userId })
        if (err) throw err

        return user
      } catch {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token')
      }
    }

    request.tokensService = {
      sign(sub: string) {
        return reply.jwtSign({ sub })
      },
    }
  })
})
