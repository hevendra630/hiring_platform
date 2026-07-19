import { ApiError } from '@utils/ApiError';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

/**
 * Uses the Access Token the frontend received from Google Identity Services
 * to fetch the user's profile from the Google UserInfo endpoint.
 */
export async function verifyGoogleIdToken(accessToken: string): Promise<GoogleProfile> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}`);
    }

    const payload = (await response.json()) as Record<string, any>;

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
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw ApiError.unauthorized('Invalid Google access token');
  }
}
