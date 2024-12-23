import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { AsyncResult, R } from '../../types/result'

interface Input {
  shared_id: string
  user: User
}

type Output = AsyncResult<null>

export class UnshareContent {
  constructor(private prisma: PrismaClient) {}

  async call({ user, shared_id }: Input): Output {
    const shared = await this.prisma.share.findFirst({
      where: {
        id: shared_id,
        content: {
          user_id: user.id,
        },
      },
    })

    if (!shared) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.not.shared')
    }

    await this.prisma.share.update({
      where: { id: shared.id },
      data: {
        expires_at: new Date(),
      },
    })

    return R.success(null)
  }
}
