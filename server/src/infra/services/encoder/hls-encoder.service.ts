import { EncoderService } from '@/src/core/services/encoder.service'
import { encodeToHLS } from '@/src/lib/hls'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'

export class HlsEncoderService implements EncoderService {
  async encode(video: string): Promise<string> {
    const fileName = randomUUID()
    const outputPath = join(
      process.cwd(),
      'tmp',
      'content',
      'stream',
      fileName,
    )

    await encodeToHLS({
      inputFile: join(process.cwd(), 'tmp', video),
      outputDir: outputPath,
    })

    return `content/stream/${fileName}/master.m3u8`
  }
}
