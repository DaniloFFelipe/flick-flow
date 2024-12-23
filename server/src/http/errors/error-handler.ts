import {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify'
import { ZodError } from 'zod'
import { AppError } from './app-error'

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  console.warn(error)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'validation-error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.code).send({
      message: error.message,
    } as any)
  }

  // send error to some observability platform
  return reply.status(500).send({ message: 'Internal server error' })
}
