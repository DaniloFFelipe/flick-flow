import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { S3 } from '@aws-sdk/client-s3'
import { s3 } from '@/src/lib/s3'
import { StorageService } from '@/src/core/services/storage.service'
import { S3StorageService } from '@/src/infra/services/storage/s3-storage.service'

declare module 'fastify' {
  export interface FastifyInstance {
    s3: S3
    storageService: StorageService
  }
}

export const s3Plugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('onReady', () => {
    app.s3 = s3
    app.storageService = new S3StorageService(s3)
  })
})
