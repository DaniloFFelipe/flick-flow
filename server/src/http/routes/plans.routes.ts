import z from 'zod'

import { ZodFastifyInstace } from '../types/fastify'
import { StatusCodes } from 'http-status-codes'
import { auth } from '../middlewares/auth.middleware'
import { GetPlans } from '@/src/core/use-cases/plans/get-plans'

export async function plansRoutes(app: ZodFastifyInstace) {
  app.register(auth).get(
    '/plans',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Plans'],
        response: {
          200: z.object({
            plans: z.array(
              z.object({
                name: z.string(),
                id: z.string(),
                price_in_cents: z.number(),
                max_content_length: z.number(),
                is_subscribed: z.boolean(),
              }),
            ),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const useCase = new GetPlans(request.prisma)
      const [resp, error] = await useCase.call({
        user_id: await request.getUserId(),
      })
      if (error) {
        return reply.status(error.code).send({ message: error.message })
      }
      return reply.status(StatusCodes.CREATED).send(resp)
    },
  )
}
