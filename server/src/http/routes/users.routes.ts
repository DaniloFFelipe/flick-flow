import z from 'zod'
import { ZodFastifyInstace } from '../types/fastify'
import { Register } from '@/src/core/use-cases/users/register'
import { StatusCodes } from 'http-status-codes'
import { auth } from '../middlewares/auth.middleware'
import { Authenticate } from '@/src/core/use-cases/users/authenticate'

export async function userRoutes(app: ZodFastifyInstace) {
  app.post(
    '/users/register',
    {
      schema: {
        tags: ['Users'],
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6),
          avatar_path: z.string(),
        }),
        response: {
          201: z.object({
            user_id: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const useCase = new Register(request.prisma)
      const [resp, error] = await useCase.call(request.body)
      if (error)
        return reply.status(error.code).send({ message: error.message })
      return reply.status(StatusCodes.CREATED).send(resp)
    },
  )

  app.register(auth).post(
    '/session/auth',
    {
      schema: {
        tags: ['Users'],
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const useCase = new Authenticate(request.prisma, request.tokensService)
      const [resp, error] = await useCase.call(request.body)
      if (error)
        return reply.status(error.code).send({ message: error.message })
      return reply.status(StatusCodes.CREATED).send(resp)
    },
  )

  app.register(auth).get(
    '/users/me',
    {
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            avatar_path: z.string(),
            subscriptions: z.object({
              id: z.string(),
              expires_at: z.date().nullable(),
              plan: z.object({
                id: z.string(),
                name: z.string(),
                max_content_length: z.number(),
              }),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      return reply.status(StatusCodes.OK).send(user.toJSON())
    },
  )
}
