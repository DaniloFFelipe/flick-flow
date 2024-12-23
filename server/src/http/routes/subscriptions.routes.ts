import z from 'zod'

import { ZodFastifyInstace } from '../types/fastify'
import { StatusCodes } from 'http-status-codes'
import { auth } from '../middlewares/auth.middleware'

import { Subscribe } from '@/src/core/use-cases/subcriptions/subscribe'

export async function subscriptionsRoutes(app: ZodFastifyInstace) {
  app.register(auth).post(
    '/subscriptions/subscribe',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Subscriptions'],
        body: z.object({
          plan_id: z.string(),
        }),
        response: {
          201: z.object({
            subscription_id: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const useCase = new Subscribe(request.prisma)
      const [resp, error] = await useCase.call({
        user_id: await request.getUserId(),
        plan_id: request.body.plan_id,
      })
      if (error) {
        return reply.status(error.code).send({ message: error.message })
      }
      return reply.status(StatusCodes.CREATED).send(resp)
    },
  )
}
