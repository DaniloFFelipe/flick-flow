import { StatusCodes } from 'http-status-codes'
import { R, Result } from '../../core/types/result'

export class AppError {
  private _code: number
  private _message: string

  constructor(code: StatusCodes, message: string) {
    this._code = code
    this._message = message
  }

  get code() {
    return this._code
  }

  get message() {
    return this._message
  }

  static r<D>(code: StatusCodes, message: string): Result<D, AppError> {
    return R.fail(new AppError(code, message))
  }
}
