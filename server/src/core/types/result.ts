import { AppError } from "../../http/errors/app-error"

export type RSuccess<Data> = [Data, null]
export type RError<Err> = [null, Err]

export type Result<Data, Err> = RSuccess<Data> | RError<Err>
export type AsyncResult<D, E = AppError> = Promise<Result<D, E>>


export const R = {
  fold<Rn, D, E>(
    result: Result<D, E>,
    onSuccess: (data: D) => Rn | Promise<Rn>,
    onFail: (error: E) => Rn | Promise<Rn> 
  ): Rn | Promise<Rn> {
    const [data, error] = result
    if (!!error) {
      return onFail(error)
    }

    return onSuccess(data!)
  },


  success<D, E>(data: D): Result<D, E> {
    return [data, null]
  },

  fail<D, E>(error: E): Result<D, E> {
    return [null, error]
  }
}
