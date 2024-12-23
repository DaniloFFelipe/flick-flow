import { ZodFastifyInstace } from '../types/fastify'
import { contentsRoutes } from './contents.routes'
import { plansRoutes } from './plans.routes'
import { subscriptionsRoutes } from './subscriptions.routes'
import { uploadRoutes } from './upload.routes'
import { userRoutes } from './users.routes'

export async function routes(app: ZodFastifyInstace) {
  app.register(userRoutes)
  app.register(plansRoutes)
  app.register(subscriptionsRoutes)
  app.register(uploadRoutes)
  app.register(contentsRoutes)
}
