import { S3, S3Client } from '@aws-sdk/client-s3'
import { Env } from './env'

export const s3Config = {
  endpoint: Env.AWS_ENDPOINT,
  region: Env.AWS_REGION,
  forcePathStyle: true,
  signatureVersion: 'v4',
  credentials: {
    accessKeyId: Env.AWS_ACCESS_KEY_ID,
    secretAccessKey: Env.AWS_SECRET_ACCESS_KEY,
  },
}
export const s3Client = new S3Client(s3Config)
export const s3 = new S3(s3Config)
