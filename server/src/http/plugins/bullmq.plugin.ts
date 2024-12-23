import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { prisma } from '@/src/lib/prisma'
import { Worker, Queue } from 'bullmq'

import { join } from 'node:path'
import { rm, unlink } from 'node:fs/promises'

declare module 'fastify' {
  export interface FastifyInstance {
    videoEncoderQueue: Queue<{ videoId: string; videoLocation: string }>
  }
}

export const bullmq = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('onReady', () => {
    app.videoEncoderQueue = new Queue<{
      videoId: string
      videoLocation: string
    }>('video-encoder', {
      connection: app.redis,
    })

    new Worker<{
      videoId: string
      videoLocation: string
    }>(
      'video-encoder',
      async (job) => {
        const { videoId, videoLocation } = job.data
        await prisma.content.update({
          where: {
            id: videoId,
          },
          data: {
            status: 'processing',
          },
        })
        console.log('HLS encoding started')
        const location = await app.encoder.encode(videoLocation)
        console.log('Uploading HLS playlist to S3 and raw video to S3')
        const [locationS3, s3RawLocation] = await Promise.all([
          app.storageService.uploadFolder(
            location.split('/master.m3u8')[0],
            `tmp/${location.replace('/master.m3u8', '')}`,
            `content/stream/${videoId}`,
          ),
          app.storageService.upload(
            join(process.cwd(), 'tmp', videoLocation),
            videoLocation,
          ),
        ])
        console.log('HLS playlist and raw video uploaded to S3')
        console.log('Removing tmp file')
        await unlink(join(process.cwd(), 'tmp', videoLocation))
        await rm(
          join(process.cwd(), 'tmp', location.replace('/master.m3u8', '')),
          { recursive: true, force: true },
        )
        console.log('Removed tmp file')
        await prisma.content.update({
          where: {
            id: videoId,
          },
          data: {
            status: 'ready',
            location: locationS3.concat('/master.m3u8'),
            originalLocation: s3RawLocation,
          },
        })
      },
      {
        connection: app.redis,
      },
    )
  })
})
