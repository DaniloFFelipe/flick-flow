export abstract class TokensService {
  abstract sign(sub: string): Promise<string>
}
