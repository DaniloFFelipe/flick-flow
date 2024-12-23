import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { AsyncResult, R } from '../../types/result'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { createPaginationResponse, Paginated } from '../../types/pagination'

type Input = {
  user: User
  content_id: string

  page_index: number
  per_page: number
}

type Output = AsyncResult<
  Paginated<{
    id: string
    email: string
    expires_at: Date | null
    created_at: Date
  }>
>

export class SharedWith {
  constructor(private prisma: PrismaClient) {}

  async call({ user, content_id, page_index, per_page }: Input): Output {
    const content = await this.prisma.content.findFirst({
      where: {
        user_id: user.id,
        id: content_id,
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            sharedWith: true,
          },
        },
        sharedWith: {
          select: {
            id: true,
            email: true,
            expires_at: true,
            created_at: true,
          },
          skip: page_index * per_page,
          take: per_page,
        },
      },
    })

    if (!content) {
      return AppError.r(StatusCodes.BAD_REQUEST, 'content.not.found')
    }

    return R.success(
      createPaginationResponse(content.sharedWith, content._count.sharedWith, {
        page_index,
        per_page,
      }),
    )
  }
}
