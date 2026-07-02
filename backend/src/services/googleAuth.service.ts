import { OAuth2Client } from 'google-auth-library';
import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';

const client = new OAuth2Client(env.google.clientId);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

/**
 * Verifies the ID token the frontend received from Google Identity Services,
 * and extracts a normalized profile. Throws if the token is invalid/expired
 * or wasn't issued for this app's client ID.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: env.google.clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new Error('Incomplete Google profile payload');
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0],
      avatarUrl: payload.picture,
      emailVerified: payload.email_verified ?? false,
    };
  } catch {
    throw ApiError.unauthorized('Invalid Google ID token');
  }
}
