import { PrismaClient } from "@prisma/client"
import { AsyncResult, R } from "../../types/result"
import { TokensService } from "../../services/tokens.service"
import { AppError } from "../../../http/errors/app-error"
import { StatusCodes } from "http-status-codes"
import { compare } from "bcrypt"

type Input = {
  email: string
  password: string
}
type Output = AsyncResult<{ token: string }>

export class Authenticate {
  constructor(
    private prisma: PrismaClient,
    private tokenService: TokensService
  ){}

  async call({ email, password }: Input): Output {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return AppError.r(StatusCodes.BAD_REQUEST, 'creadential.invalid')

    const isPasswordValid = await compare(password, user.password_hash)
    if (!isPasswordValid) return AppError.r(StatusCodes.BAD_REQUEST, 'creadential.invalid')

    return R.success({
      token: await this.tokenService.sign(user.id)
    })
  } 
} 
