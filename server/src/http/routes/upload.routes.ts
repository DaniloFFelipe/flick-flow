import { ZodFastifyInstace } from '../types/fastify'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import z from 'zod'

import { assets } from '../middlewares/assets.middleware'
import { AppError } from '../errors/app-error'
import { StatusCodes } from 'http-status-codes'

const pump = promisify(pipeline)

export function uploadRoutes(app: ZodFastifyInstace) {
  app.register(assets).post(
    '/upload',
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ['Utils'],
        response: {
          201: z.object({
            fileName: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const upload = await request.file()

      if (!upload) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'invalid.file')
      }

      const mimeTypeRegex = /^(image)\/[a-zA-Z]+/
      const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

      if (!isValidFileFormat) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'invalid.format')
      }

      const fileId = randomUUID()
      const extension = extname(upload.filename)

      const fileName = fileId.concat(extension)

      const writeStream = createWriteStream(
        resolve(process.cwd(), 'tmp', 'images', fileName),
      )

      await pump(upload.file, writeStream)

      return reply.status(201).send({
        fileName,
      })
    },
  )
}
