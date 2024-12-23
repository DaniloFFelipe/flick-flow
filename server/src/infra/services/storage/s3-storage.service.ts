import { StorageService } from '@/src/core/services/storage.service'
import { S3 } from '@aws-sdk/client-s3'
import { Env } from '@/src/lib/env'
import { AppError } from '@/src/http/errors/app-error'
import { StatusCodes } from 'http-status-codes'
import { extname, resolve } from 'node:path'
import { createReadStream, createWriteStream, WriteStream } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'

const EXTS: Record<string, string> = {
  mp4: 'video/mp4',
  mkv: 'video/x-matroska',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export class S3StorageService implements StorageService {
  constructor(private s3Client: S3) {}

  async upload(path: string, location: string): Promise<string> {
    const fileName = path.split('/').pop()
    if (!fileName) {
      console.error(new AppError(StatusCodes.BAD_REQUEST, 'Invalid file'))
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid file')
    }
    const ContentType = EXTS[extname(fileName)]

    console.log('Uploading file')
    try {
      await this.s3Client.putObject({
        Bucket: Env.AWS_BUCKET,
        Key: location,
        Body: await readFile(path),
        ContentType,
        ACL: 'public-read',
      })

      console.log('Uploading end')
    } catch (error) {
      console.error(error)
    }

    return location
  }

  async uploadFolder(
    folderName: string,
    folderPath: string,
    storagePath: string,
  ): Promise<string> {
    const files = (await this.getFiles(
      resolve(process.cwd(), folderPath),
    )) as string[]

    const uploads = files.map((filePath) => {
      const key = storagePath.concat(filePath.split(folderName)[1])
      return this.s3Client.putObject({
        Key: key,
        Bucket: Env.AWS_BUCKET,
        Body: createReadStream(filePath),
      })
    })
    await Promise.all(uploads)

    return storagePath
  }

  private async getFiles(dir: string): Promise<string | string[]> {
    const dirents = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name)
        return dirent.isDirectory() ? this.getFiles(res) : res
      }),
    )
    return Array.prototype.concat(...files)
  }

  async download(inputPath: string, outputPath: string): Promise<void> {
    const fileObject = await this.s3Client.getObject({
      Bucket: Env.AWS_BUCKET,
      Key: inputPath,
    })

    if (!fileObject.Body) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid body')
    }

    const byteArray = Buffer.from(await fileObject.Body.transformToByteArray())
    const tmpLocation = resolve(process.cwd(), outputPath)
    const writeStream = createWriteStream(tmpLocation)
    await this.writeFile(writeStream, byteArray)
  }

  private async writeFile(stream: WriteStream, buffer: Buffer): Promise<void> {
    return await new Promise((resolve, reject) => {
      stream.write(buffer, (error) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    })
  }
}
