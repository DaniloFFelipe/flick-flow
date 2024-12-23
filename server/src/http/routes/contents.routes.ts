import z from 'zod'

import { ZodFastifyInstace } from '../types/fastify'
import { StatusCodes } from 'http-status-codes'
import { auth } from '../middlewares/auth.middleware'

import { CreateContent } from '@/src/core/use-cases/contents/create-content'
import { AppError } from '../errors/app-error'
import { ListUserContents } from '@/src/core/use-cases/contents/list-user-contents'
import {
  paginatedMetadataSchema,
  paginationSchema,
} from '@/src/core/types/pagination'
import { DeleteContent } from '@/src/core/use-cases/contents/delete-content'
import { UpdateContent } from '@/src/core/use-cases/contents/udpate-content'
import { ShareContent } from '@/src/core/use-cases/share/share-content'
import { UnshareContent } from '@/src/core/use-cases/share/unshare-content'
import { SharedWith } from '@/src/core/use-cases/share/shared-with'
import { ListUserSharedContent } from '@/src/core/use-cases/share/list-user-shared-content'
import { PlayContent } from '@/src/core/use-cases/contents/play-content'

export async function contentsRoutes(app: ZodFastifyInstace) {
  app.register(auth).post(
    '/contents',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        querystring: z.object({
          name: z.string(),
          description: z.string(),
          thumbnail: z.string().optional(),
        }),
        response: {
          201: z.object({
            content_id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new CreateContent(request.prisma, app.videoEncoderQueue)
      const upload = await request.file()

      if (!upload) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'invalid.file')
      }

      const mimeTypeRegex = /^(video)\/[a-zA-Z]+/
      const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

      if (!isValidFileFormat) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'invalid.format')
      }

      const [resp, error] = await useCase.call({
        description: request.query.description,
        name: request.query.name,
        thumbnail: request.query.thumbnail,
        user,
        file: upload,
      })
      if (error) {
        throw error
      }
      return reply.status(StatusCodes.CREATED).send(resp)
    },
  )

  app.register(auth).get(
    '/contents',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        querystring: paginationSchema,
        response: {
          200: z.object({
            meta: paginatedMetadataSchema,
            data: z.array(
              z.object({
                id: z.string(),
                thumbnail_path: z.string(),
                name: z.string(),
                description: z.string(),
                duration_in_sec: z.number(),
                status: z.enum(['pending', 'processing', 'ready']),
                created_at: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new ListUserContents(request.prisma)
      const resp = await useCase.call({ user, ...request.query })

      return reply.status(StatusCodes.OK).send(resp)
    },
  )

  app.register(auth).delete(
    '/contents/:content_id',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        params: z.object({
          content_id: z.string(),
        }),
        response: {
          204: z.object({}),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new DeleteContent(request.prisma)
      const [, err] = await useCase.call({
        user,
        content_id: request.params.content_id,
      })
      if (err) throw err

      return reply.status(StatusCodes.OK).send({})
    },
  )

  app.register(auth).put(
    '/contents/:content_id',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        params: z.object({
          content_id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
        }),
        response: {
          201: z.object({
            content_id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new UpdateContent(request.prisma)
      const [data, err] = await useCase.call({
        user,
        content_id: request.params.content_id,
        ...request.body,
      })
      if (err) throw err

      return reply.status(StatusCodes.OK).send({
        content_id: data.content_id,
      })
    },
  )

  app.register(auth).patch(
    '/contents/:content_id/share',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        params: z.object({
          content_id: z.string(),
        }),
        body: z.object({
          email: z.string().email(),
          available_until: z.coerce.date().optional(),
        }),
        response: {
          204: z.object({}),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new ShareContent(request.prisma)
      const [, err] = await useCase.call({
        user,
        content_id: request.params.content_id,
        ...request.body,
      })
      if (err) throw err

      return reply.status(StatusCodes.NO_CONTENT).send({})
    },
  )

  app.register(auth).delete(
    '/unshare/:shared_id',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        params: z.object({
          content_id: z.string(),
          shared_id: z.string(),
        }),
        response: {
          204: z.object({}),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new UnshareContent(request.prisma)
      const [, err] = await useCase.call({
        user,
        shared_id: request.params.shared_id,
      })
      if (err) throw err

      return reply.status(StatusCodes.NO_CONTENT).send({})
    },
  )

  app.register(auth).get(
    '/contents/:content_id/share',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        querystring: paginationSchema,
        params: z.object({
          content_id: z.string(),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            meta: paginatedMetadataSchema,
            data: z.array(
              z.object({
                id: z.string(),
                email: z.string(),
                expires_at: z.date().nullable(),
                created_at: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new SharedWith(request.prisma)
      const [data, err] = await useCase.call({
        user,
        content_id: request.params.content_id,
        ...request.query,
      })
      if (err) throw err

      return reply.status(StatusCodes.OK).send(data)
    },
  )

  app.register(auth).get(
    '/me/contents/share',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        querystring: paginationSchema,
        response: {
          [StatusCodes.OK]: z.object({
            meta: paginatedMetadataSchema,
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string(),
                thumbnail_path: z.string(),
                duration_in_sec: z.number(),
                created_at: z.date(),
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  avatar_path: z.string(),
                }),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new ListUserSharedContent(request.prisma)
      const data = await useCase.call({
        user,
        ...request.query,
      })

      return reply.status(StatusCodes.OK).send(data)
    },
  )

  app.register(auth).get(
    '/contents/:content_id/play',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Contents'],
        params: z.object({
          content_id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const user = await request.getUser()
      const useCase = new PlayContent(request.prisma)
      const [data, err] = await useCase.call({
        user,
        content_id: request.params.content_id,
      })
      if (err) throw err

      return reply.redirect(data.url)
    },
  )
}
