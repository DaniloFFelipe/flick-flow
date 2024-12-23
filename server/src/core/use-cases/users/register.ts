import { PrismaClient } from '@prisma/client'
import { AsyncResult, R } from '../../types/result'
import { AppError } from '../../../http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { hash } from 'bcrypt'

type Input = {
  name: string
  email: string
  password: string
  avatar_path: string
}

type Output = {
  user_id: string
}

export class Register {
  constructor(private prisma: PrismaClient) {}

  async call({
    name,
    email,
    password,
    avatar_path,
  }: Input): AsyncResult<Output> {
    const emailExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (emailExists)
      return R.fail(new AppError(StatusCodes.BAD_REQUEST, 'email.exists'))

    const passwordHash = await hash(password, 8)
    const freePlan = await this.prisma.plan.findFirstOrThrow({
      where: {
        name: 'Free',
      },
    })
    const user = await this.prisma.user.create({
      data: {
        avatar_path,
        email,
        name,
        password_hash: passwordHash,
        subscriptions: {
          create: {
            plan_id: freePlan.id,
            expires_at: null,
          },
        },
      },
    })

    return R.success({
      user_id: user.id,
    })
  }
}
