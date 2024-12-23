import { EncoderService } from '@/src/core/services/encoder.service'

export class CopyEncoderService implements EncoderService {
  async encode(video: string): Promise<string> {
    return video
  }
}
