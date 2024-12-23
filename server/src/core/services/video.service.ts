import { MultipartFile } from '@fastify/multipart'
import ffmpeg from 'fluent-ffmpeg'
import getVideoDurationInSeconds from 'get-video-duration'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export const VideoService = {
  captureThumbnail(
    inputVideo: string,
    thumbnailOutputPath: string,
    filename: string,
    timeInSeconds = 2,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const output = join(process.cwd(), thumbnailOutputPath)
      const input = join(process.cwd(), 'tmp', inputVideo)
      ffmpeg(input)
        .screenshots({
          timestamps: [timeInSeconds],
          filename,
          folder: `${output}/`,
          size: '1920x1080',
        })
        .on('end', () => {
          resolve(`${thumbnailOutputPath}/${filename}`)
        })
        .on('error', (err) => {
          reject(err)
        })
    })
  },

  async getVideoDuration(inputVideo: string) {
    return getVideoDurationInSeconds(
      resolve(process.cwd(), 'tmp', inputVideo),
    )
  },

  async saveRawVideoFile(upload: MultipartFile) {
    const fileId = randomUUID()
    const extension = extname(upload.filename)

    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(
      resolve(process.cwd(), 'tmp', 'content', 'raw', fileName),
    )

    await pump(upload.file, writeStream)

    return `content/raw/${fileName}`
  },
}
