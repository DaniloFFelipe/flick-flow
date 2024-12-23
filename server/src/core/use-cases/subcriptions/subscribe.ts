import { PrismaClient } from '@prisma/client'
import { AsyncResult, R } from '../../types/result'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'

type Input = {
  plan_id: string
  user_id: string
}
type Output = AsyncResult<{
  subscription_id: string
}>

export class Subscribe {
  constructor(private prisma: PrismaClient) {}

  async call({ plan_id, user_id }: Input): Output {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: plan_id,
      },
    })
    if (!plan) {
      return R.fail(new AppError(StatusCodes.BAD_REQUEST, 'plan.not-found'))
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        user_id,
        expires_at: { gt: new Date() },
        plan: {
          name: {
            not: 'Free',
          },
        },
      },
    })

    if (subscription?.plan_id === plan_id) {
      return R.fail(
        new AppError(StatusCodes.BAD_REQUEST, 'subscription.exists'),
      )
    }

    if (subscription?.plan_id !== plan_id) {
      await this.prisma.subscription.update({
        where: {
          id: subscription!.id,
        },
        data: {
          expires_at: new Date(),
        },
      })
    }

    const newSubscription = await this.prisma.subscription.create({
      data: {
        plan_id,
        user_id,
        expires_at: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      },
    })

    return R.success({ subscription_id: newSubscription.id })
  }
}
