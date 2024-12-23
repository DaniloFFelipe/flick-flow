export abstract class EncoderService {
  abstract encode(video: string): Promise<string>
}
