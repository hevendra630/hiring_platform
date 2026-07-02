import crypto from 'crypto';

export class TokenService {
  /** Returns [plainToken (sent to user), hashedToken (stored in DB)] */
  generateTokenPair(): { plainToken: string; hashedToken: string } {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    return { plainToken, hashedToken };
  }

  hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const tokenService = new TokenService();
