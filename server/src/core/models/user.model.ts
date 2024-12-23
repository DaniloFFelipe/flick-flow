// import { prisma } from '@/src/lib/prisma'
import { Model } from './model'

export type UserProps = {
  id: string
  name: string
  email: string
  avatar_path: string
  content_count: number
  subscriptions: {
    id: string
    expires_at: Date | null
    plan: {
      id: string
      name: string
      max_content_length: number
    }
  }
}

export class User extends Model<UserProps> {
  get name() {
    return this._props.name
  }

  get email() {
    return this._props.email
  }

  get avatar_path() {
    return this._props.avatar_path
  }

  get subscriptions() {
    return this._props.subscriptions
  }

  get canCreateContent() {
    return (
      this._props.content_count + 1 <=
      this._props.subscriptions.plan.max_content_length
    )
  }

  toJSON() {
    return this._props
  }

  static c(props: UserProps) {
    return new User(props)
  }
}
