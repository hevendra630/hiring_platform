import crypto from 'crypto';
import { Session, ISession } from '@models/Session';
import { Types } from 'mongoose';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class SessionRepository {
  async create(params: {
    user: Types.ObjectId | string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<ISession> {
    return Session.create({
      user: params.user,
      refreshTokenHash: hashToken(params.refreshToken),
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt: params.expiresAt,
    });
  }

  async findActiveByToken(refreshToken: string): Promise<ISession | null> {
    return Session.findOne({
      refreshTokenHash: hashToken(refreshToken),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async revoke(sessionId: Types.ObjectId | string): Promise<void> {
    await Session.updateOne({ _id: sessionId }, { isRevoked: true });
  }

  async revokeAllForUser(userId: Types.ObjectId | string): Promise<void> {
    await Session.updateMany({ user: userId }, { isRevoked: true });
  }
}

export const sessionRepository = new SessionRepository();
