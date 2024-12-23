import { MultipartFile } from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { AsyncResult, R } from '../../types/result'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { VideoService } from '../../services/video.service'
import { randomUUID } from 'crypto'
import { Queue } from 'bullmq'

type Input = {
  file: MultipartFile
  user: User
  name: string
  description: string
  thumbnail?: string
}

type Output = AsyncResult<{
  content_id: string
}>

type QueueProps = {
  videoId: string
  videoLocation: string
}

export class CreateContent {
  constructor(
    private prisma: PrismaClient,
    private queue: Queue<QueueProps>,
  ) {}

  async call({ description, name, user, file, thumbnail }: Input): Output {
    if (!user.canCreateContent) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'user.can.not.create.content')
    }

    const fileName = await VideoService.saveRawVideoFile(file)
    let thumbnailPath: string
    if (!thumbnail) {
      thumbnailPath = await VideoService.captureThumbnail(
        fileName,
        'tmp/content/thumbnails',
        `${randomUUID()}.png`,
      )
    } else {
      thumbnailPath = thumbnail
    }

    const durationInSec = await VideoService.getVideoDuration(fileName)
    const content = await this.prisma.content.create({
      data: {
        name,
        description,
        user_id: user.id,
        thumbnail_path: thumbnailPath.replace('tmp/', ''),
        originalLocation: fileName,
        duration_in_sec: durationInSec,
      },
    })

    await this.queue.add('encode', {
      videoId: content.id,
      videoLocation: content.originalLocation,
    })

    return R.success({
      content_id: content.id,
    })
  }
}
