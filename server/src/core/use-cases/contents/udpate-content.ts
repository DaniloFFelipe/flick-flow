import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { AsyncResult, R } from '../../types/result'

type Input = {
  user: User
  content_id: string

  name?: string
  description?: string
}

type Output = AsyncResult<{
  content_id: string
}>

export class UpdateContent {
  constructor(private prisma: PrismaClient) {}

  async call({ user, content_id, ...data }: Input): Output {
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

    await this.prisma.content.update({
      where: {
        id: content_id,
      },
      data,
    })

    return R.success({ content_id })
  }
}
