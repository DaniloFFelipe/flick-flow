import { Plan, PrismaClient } from '@prisma/client'
import { AsyncResult, R } from '../../types/result'

type Input = {
  user_id: string
}
type Output = AsyncResult<{
  plans: {
    name: string
    id: string
    price_in_cents: number
    max_content_length: number
    is_subscribed: boolean
  }[]
}>

export class GetPlans {
  constructor(private prisma: PrismaClient) {}

  async call({ user_id }: Input): Output {
    const plansRaw = await this.prisma.plan.findMany({
      include: {
        subscriptions: {
          select: {
            id: true,
          },
          where: {
            user_id,
            plan: {
              name: {
                not: 'Free',
              },
            },
            OR: [{ expires_at: { gt: new Date() } }, { expires_at: null }],
          },
        },
      },
    })

    const plans = plansRaw.map((plan) => {
      return {
        name: plan.name,
        id: plan.id,
        price_in_cents: plan.price_in_cents,
        max_content_length: plan.max_content_length,
        is_subscribed: plan.subscriptions.length > 0,
      }
    })

    return R.success({ plans })
  }
}
