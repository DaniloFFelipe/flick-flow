import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { AsyncResult, R } from '../../types/result'

interface Input {
  user: User
  content_id: string
  email: string
  available_until?: Date
}

type Output = AsyncResult<null>

export class ShareContent {
  constructor(private prisma: PrismaClient) {}

  async call({ user, content_id, email, available_until }: Input): Output {
    const content = await this.prisma.content.findFirst({
      where: {
        id: content_id,
        user_id: user.id,
        deleted_at: null,
      },
    })

    if (!content) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.not.found')
    }

    const share = await this.prisma.share.findFirst({
      where: {
        email,
        content_id,
        OR: [{ expires_at: { gt: new Date() } }, { expires_at: null }],
      },
    })

    if (share) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.already.shared')
    }

    await this.prisma.share.create({
      data: {
        content_id,
        email,
        expires_at: available_until,
      },
    })

    return R.success(null)
  }
}
