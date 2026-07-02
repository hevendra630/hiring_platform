import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
  tokenVersion: number; // bumped on password change / logout-all to invalidate old refresh tokens
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}
