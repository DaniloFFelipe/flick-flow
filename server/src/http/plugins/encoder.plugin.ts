import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { EncoderService } from '@/src/core/services/encoder.service'
import { HlsEncoderService } from '@/src/infra/services/encoder/hls-encoder.service'

declare module 'fastify' {
  export interface FastifyInstance {
    encoder: EncoderService
  }
}

export const encoder = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('onReady', () => {
    app.encoder = new HlsEncoderService()
  })
})
