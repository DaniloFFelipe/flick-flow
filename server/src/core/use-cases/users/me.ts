import { PrismaClient } from '@prisma/client'
import { AsyncResult, R } from '../../types/result'
import { User } from '../../models/user.model'

type Input = {
  user_id: string
}
type Output = AsyncResult<User>

export class Me {
  constructor(private prisma: PrismaClient) {}

  async call({ user_id }: Input): Output {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_path: true,
        contents: {
          select: {
            id: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            expires_at: true,
            plan: {
              select: {
                id: true,
                name: true,
                max_content_length: true,
              },
            },
          },
          where: {
            OR: [{ expires_at: { gt: new Date() } }, { expires_at: null }],
          },
        },
      },
    })

    return R.success(
      User.c({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_path: user.avatar_path,
        content_count: user.contents.length,
        subscriptions: {
          id: user.subscriptions[0].id,
          expires_at: user.subscriptions[0].expires_at,
          plan: {
            id: user.subscriptions[0].plan.id,
            name: user.subscriptions[0].plan.name,
            max_content_length: user.subscriptions[0].plan.max_content_length,
          },
        },
      }),
    )
  }
}
