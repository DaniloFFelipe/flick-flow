import { fastify } from 'fastify'
import multipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './errors/error-handler'
import { Env } from '../lib/env'
import { database } from './plugins/db.plugin'
import { routes } from './routes'
import fastifyStatic from '@fastify/static'
import { fastifyRedis } from '@fastify/redis'
import { join } from 'path'
import { bullmq } from './plugins/bullmq.plugin'
import { encoder } from './plugins/encoder.plugin'
import { s3Plugin } from './plugins/s3.plugin'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'FlickFlow Api',
      description: 'Api Docs',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})
app.setErrorHandler(errorHandler)

app.register(fastifyJwt, {
  secret: Env.JWT_SECRET,
})

app.register(multipart, {
  limits: {
    fileSize: 30720 * 1024 * 1024, // 30gb limit
  },
})
app.register(fastifyStatic, {
  root: join(process.cwd(), 'tmp'),
  prefix: '/tmp',
})

app.register(database)
app.register(fastifyRedis, {
  host: Env.REDIS_HOST,
  port: Env.REDIS_PORT,
  maxRetriesPerRequest: null,
})
app.register(encoder)
app.register(bullmq)
app.register(s3Plugin)
app.register(routes)

app //
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then((server) =>
    console.log(
      'Server is running on: ',
      server.replace('127.0.0.1', 'localhost'),
    ),
  )
