import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { createPaginationResponse } from '../../types/pagination'

type Input = {
  user: User
  page_index: number
  per_page: number
}

export class ListUserSharedContent {
  constructor(private prisma: PrismaClient) {}

  async call({ user, page_index, per_page }: Input) {
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          thumbnail_path: true,
          duration_in_sec: true,
          created_at: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar_path: true,
            },
          },
        },
        where: {
          sharedWith: {
            some: {
              email: user.email,
            },
          },
          deleted_at: null,
          status: 'ready',
        },
        skip: page_index * per_page,
        take: per_page,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.content.count({
        where: {
          sharedWith: {
            some: {
              email: user.email,
            },
          },
          deleted_at: null,
          status: 'ready',
        },
      }),
    ])

    return createPaginationResponse(contents, total, { page_index, per_page })
  }
}
