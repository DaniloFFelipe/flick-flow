import { PrismaClient } from '@prisma/client'
import { User } from '../../models/user.model'
import { createPaginationResponse } from '../../types/pagination'

type Input = {
  user: User
  q?: string

  page_index: number
  per_page: number
}

export class ListUserContents {
  constructor(private prisma: PrismaClient) {}

  async call({ user, q = '', page_index, per_page }: Input) {
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          location: true,
          thumbnail_path: true,
          duration_in_sec: true,
          created_at: true,
        },
        where: {
          user_id: user.id,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          deleted_at: null,
        },
        skip: page_index * per_page,
        take: per_page,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.content.count({
        where: {
          user_id: user.id,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
      }),
    ])

    return createPaginationResponse(contents, total, {
      page_index,
      per_page,
    })
  }
}
