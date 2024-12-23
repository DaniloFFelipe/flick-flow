import { PrismaClient } from '@prisma/client'
import { AsyncResult, R } from '../../types/result'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '@/src/http/errors/app-error'
import { Env } from '@/src/lib/env'
import { User } from '../../models/user.model'

type Input = {
  user: User
  content_id: string
}

type Output = AsyncResult<{
  url: string
}>

export class PlayContent {
  constructor(private prisma: PrismaClient) {}

  async call({ content_id, user }: Input): Output {
    const content = await this.prisma.content.findFirst({
      select: {
        location: true,
      },
      where: {
        id: content_id,
        deleted_at: null,
        OR: [
          { user_id: user.id },
          {
            sharedWith: {
              some: {
                email: user.email,
                OR: [{ expires_at: { gt: new Date() } }, { expires_at: null }],
              },
            },
          },
        ],
      },
    })

    if (!content) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.not.found')
    }

    if (!content.location) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.cannot.be-played')
    }

    return R.success({
      url: `${Env.STREAM_CND_BASE_URL}/${Env.AWS_BUCKET}/${content.location}`,
    })
  }
}
